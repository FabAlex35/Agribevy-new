"use client";
import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');
};

const Invoice = ({ data }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const path = data?.logo.split('\\')
    const imgPath = `http://localhost:3000/api/images/${path[path.length - 1]}`
    // const downloadInvoiceAsPDF = async () => {
    //     const element = document.getElementById('invoice');

    //     // Use html2canvas to take a screenshot of the invoice element
    //     const canvas = await html2canvas(element, { scale: 2 }); // Increase scale for better resolution
    //     const imgData = canvas.toDataURL('image/png');

    //     const pdf = new jsPDF('l', 'mm', 'a4'); // Changed to A4 size, mm unit for better fit
    //     const imgWidth = 300; // Width of A4 page in mm
    //     const pageHeight = pdf.internal.pageSize.height;
    //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //     let heightLeft = imgHeight;

    //     let position = 0;

    //     // Add the first page
    //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); // Set X position to 0 for full width
    //     heightLeft -= pageHeight;

    //     // Add more pages if needed
    //     while (heightLeft >= 0) {
    //         position = heightLeft - imgHeight;
    //         pdf.addPage();
    //         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //         heightLeft -= pageHeight;
    //     }

    //     // Save the PDF
    //     pdf.save(`${data?.user_name}_${data?.transaction_id}.pdf`);
    // };
    const downloadInvoiceAsPDF = async () => {
        const element = document.getElementById('invoice');

        // Use html2canvas to capture the invoice element with increased scale for better quality
        const canvas = await html2canvas(element, { scale: 2 }); // Increased scale
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4 size, mm units
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20; // Add some margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10; // Start 10mm from the top for better margins
        let heightLeft = imgHeight;

        // Add pages dynamically
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(`${data?.user_name}_${data?.transaction_id}.pdf`);
    };

    const printInvoice = async () => {
        const element = document.getElementById('invoice');

        // Use html2canvas to capture the invoice element with increased scale for better quality
        const canvas = await html2canvas(element, { scale: 2 }); // Increased scale
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4 size, mm units
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20; // Add some margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10; // Start 10mm from the top for better margins
        let heightLeft = imgHeight;

        // Add pages dynamically
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Open the print dialog
        const pdfBlob = pdf.output('blob'); // Get the PDF as a blob
        const pdfURL = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfURL, '_blank'); // Open in a new tab/window

        if (printWindow) {
            // Once the new window is fully loaded, trigger print
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            alert('Popup blocked! Please allow popups for this website.');
        }
    };


    const commissionAmount = Math.ceil((data?.amount || 0) * ((data?.commission || 0) / 100));
    const magamaiAmount = Math.ceil((data?.amount || 0) * ((data?.commission || 0) / 100) * ((data?.magamai || 0) / 100));

    return (
        <>
            <div className="text-end mt-2">
                <button onClick={downloadInvoiceAsPDF} className="btn submit-btn">
                    Download as PDF
                </button>
                <button onClick={printInvoice} className="btn submit-btn requirement-btn ms-2">
                    Print
                </button>
            </div>
            <div className="invoice-container bg-white p-4 border border-dark mt-3" id="invoice">
                <div className="text-center mb-4">
                    {/* <img width={100} height={50} src={`${baseUrl}/${data?.logo}`} /> */}
                    <img width={100} height={50} src={imgPath} />
                    <h1 className="display-6 fw-bold">{data?.user_name}</h1>
                    <p className="mb-0">{data?.user_address}</p>
                    <p>Mobile: {data?.marketer_mobile}</p>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <p className="mb-0">Invoice No: {data?.transaction_id}</p>
                        <p>Date: {formatDate(data?.soldDate)}</p>
                        <p>Farmer name: {data?.farmer_name}</p>
                    </div>
                </div>

                <table className="table border border-dark mb-4">
                    <thead>
                        <tr>
                            <th scope="col">Item</th>
                            <th scope="col" className="text-end">Quantity</th>
                            <th scope="col" className="text-end">Price</th>
                            <th scope="col" className="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td scope="col">{data?.veg_name}</td>
                            <td scope="col" className="text-end">{data?.sold}</td>
                            <td scope="col" className="text-end">{(data?.amount / data?.sold).toFixed(2)}</td>
                            <td scope="col" className="text-end">{data?.amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="row align-items-center">
                    <div className="col-6 text-start">
                        <h5>Payment Status: {data?.farmer_status === "paid" ? "Paid" : "Unpaid"}</h5>
                    </div>
                    <div className="col-6 text-end">
                        <p className="mb-0">Commission: {commissionAmount || 0}</p>
                        <p className="mb-0">Magamai: {magamaiAmount || 0}</p>
                        <p className="mb-0">Coolie: {data?.farmer_wage || 0}</p>
                        <p className="mb-0">Rent: {data?.farmer_rent || 0}</p>
                        <p className="mb-0">Advance: {data?.advance || 0}</p>
                        <p className="fw-bold">
                            Total: {
                                (data?.amount || 0) -
                                (
                                    commissionAmount +
                                    (data?.farmer_wage || 0) +
                                    magamaiAmount +
                                    (data?.farmer_rent || 0)
                                )
                            }
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Invoice;
