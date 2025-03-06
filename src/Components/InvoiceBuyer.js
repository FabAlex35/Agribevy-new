"use client";
import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FiDownload, FiPrinter } from "react-icons/fi";

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        .replace(/\//g, "/");
};

const InvoiceBuyer = ({ data, closeModal,language }) => {
    const invoiceRef = useRef();
    const path = data?.logo?.split("\\");
    const imgPath = `http://localhost:3000/api/images/${path?.[path.length - 1]}`;

    const downloadInvoiceAsPDF = async () => {
        const element = document.getElementById("invoice");
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${data?.user_name}_${data?.transaction_id}.pdf`);
    };

    const printInvoice = async () => {
        const element = document.getElementById("invoice");
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output("blob");
        const pdfURL = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfURL, "_blank");

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            alert("Popup blocked! Please allow popups for this website.");
        }
    };

    return (
        <div className="modal-overlay d-flex align-items-center justify-content-center"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                zIndex: 1050,
            }}
        >
            <div
                className="d-flex"
                style={{ width: "90%", maxWidth: "800px", position: "relative" }}
            >
                <div
                    className="invoice-container bg-white p-4 border border-dark position-relative"
                    id="invoice"
                    ref={invoiceRef}
                    style={{
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                        width: "100%",
                    }}
                >
                    <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 1,
                        }}
                    ></button>
                    <div className="text-center mb-4">
                        <img width={100} height={50} src={imgPath} alt="Logo" />
                        <h1 className="display-6 fw-bold">{data?.user_name}</h1>
                        <p className="mb-0">{data?.user_address}</p>
                        <p>Mobile: {data?.marketer_mobile}</p>
                    </div>
                    <div className="row mb-4">
                        <div className="col-12">
                            <p className="mb-0">{language==="tamil"?"விலைப்பட்டியல் எண்":"Invoice No."}: {data?.invoice_Id}</p>
                            <p>{language==="tamil"?"தேதி":"Date"}: {formatDate(data?.soldDate)}</p>
                            <p>{language==="tamil"?"பெயர்":"Buyer name"}: {data?.buyer_name}</p>
                        </div>
                    </div>
                    <table className="table border border-dark mb-4">
                            <thead>
                                <tr>
                                    <th scope="col" className="text-center">{language === "tamil" ? "விலை" : "Price"}</th>
                                    <th scope="col">{language === "tamil" ? "விபரம்" : "Item"}</th>
                                    <th scope="col" className="text-center">{language === "tamil" ? "எடை" : "Weight"}</th>
                                    <th scope="col" className="text-center">{language === "tamil" ? "மொத்த எடை" : "Total Weight"}</th>
                                    <th scope="col" className="text-center">{language === "tamil" ? "மொத்த தொகை" : "Total Amount"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.details
                                
                                    ?.reduce((acc, item) => {
                                        
                                        let existingItem = acc.find((v) => v.veg_name === item.veg_name);
                                        if (existingItem) {
                                            existingItem.weights.push(item.quantity);
                                            existingItem.totalQuantity += item.quantity;
                                            existingItem.amount += item.amount;
                                        } else {
                                            acc.push({ 
                                                ...item, 
                                                weights: [item.quantity], 
                                                totalQuantity: item.quantity,
                                                amount: item.amount
                                            });
                                        }
                                        return acc;
                                    }, [])
                                    .map((v, i) => (
                                        <tr key={i}>
                                            <td className="text-center align-top" rowSpan={1} style={{ borderBottom: "none" }}>
                                                {(v.amount / v.totalQuantity).toFixed(2)}
                                            </td>
                                            <td className="align-top" rowSpan={1} style={{ borderBottom: "none" }}>
                                                {language === "tamil" ? data?.tamil_name : v.veg_name}
                                            </td>
                                            <td className="text-center" style={{ whiteSpace: "pre-line", borderBottom: "none" }}>
                                                {v.weights.map((w, idx) => (idx % 5 === 0 && idx !== 0 ? `\n${w}` : `${idx === 0 ? "" : ", "}${w}`))}
                                            </td>
                                            <td className="text-center align-top" rowSpan={1} style={{ borderBottom: "none" }}>
                                                {v.totalQuantity.toFixed(2)}
                                            </td>
                                            <td className="text-center align-top" rowSpan={1} style={{ borderBottom: "none" }}>
                                                {v.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold">
                                    <td colSpan="4" className="text-end">{language === "tamil" ? "மொத்தம்" : "Grand Total"}</td>
                                    <td className="text-center">
                                        {data?.details.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>
                    <div className="row">
                        <div className="col-6 text-start">
                            <h5>
                                {language==="tamil"?"கட்டண நிலை":"Payment Status"}:{" "}
                                {data?.buyer_status === "paid" ? "Paid" : "Unpaid"}
                            </h5>
                        </div>
                        <div className="col-6 text-end">
                            <p className="mb-0">{language==="tamil"? "கூலி":"Coolie"}: {data?.total_wage || 0}</p>
                            <p className="mb-0">{language==="tamil"? "வாடகை":"Rent"}: {data?.total_rent || 0}</p>
                            <p className="mb-0">{language==="tamil"?"ரொக்கம்":"Advance"}: {data?.advance || 0}</p>
                            <p className="fw-bold">
                                {language==="tamil"?"மொத்தம்":"Total"}:{data?.buyer_amount || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    className="icon-container"
                    style={{
                        position: "absolute",
                        right: "-60px",
                        top: "0%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        onClick={downloadInvoiceAsPDF}
                        style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        <FiDownload size={24} style={{ color: "#007bff" }} />
                    </div>
                    <div
                        onClick={printInvoice}
                        style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            cursor: "pointer",
                        }}
                    >
                        <FiPrinter size={24} style={{ color: "#28a745" }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceBuyer;
