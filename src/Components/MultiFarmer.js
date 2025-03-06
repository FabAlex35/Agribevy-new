"use client";
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import Spinner from './Spinner';


const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');
};

const MultiFarmer = ({ data }) => {
    const [errMsg, setErrMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [paymentAmount, setPaymentAmount] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('')
    const [spinAdd, setSpinAdd] = useState(false)
    const [max, setMax] = useState(null)
    const [transactionType, setTransactionType] = useState("payment")
    const [advanceRupee, setAdvanceRupee] = useState(null)
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const path = data?.detail.logo.split('\\')
    const imgPath = `http://localhost:3000/api/images/${path[path.length - 1]}`

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

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
        pdf.save(`${data?.detail?.invoiceId}.pdf`);
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


    const status = () => {
        if (data?.list?.every((v) => v.farmer_status === "paid")) {
            return "Paid"
        }
        else if (data?.list?.every((v) => v.farmer_status === "pending")) {
            return "Unpaid"
        }
        else {
            return "Partly paid"
        }
    }

    return (
        <>
            <div className="text-end mt-2">
                <button onClick={downloadInvoiceAsPDF} className="btn submit-btn requirement-btn me-2">
                    Download as PDF
                </button>
                <button onClick={printInvoice} className="btn submit-btn requirement-btn ms-2">
                    Print
                </button>
            </div>
            <div className="invoice-container bg-white p-4 border border-dark mt-3" id="invoice">
                <div className="text-center mb-4">
                    {/* <img width={100} height={50} src={`${baseUrl}/${data?.detail?.logo}`} /> */}
                    <img width={100} height={50} src={imgPath} />

                    <h1 className="display-6 fw-bold">{data?.detail?.user_name}</h1>
                    <p className="mb-0">{data?.detail?.user_address}</p>
                    <p>Mobile: {data?.detail?.marketer_mobile}</p>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <p className="mb-0">Invoice No: {data?.detail?.invoiceId}</p>
                        <p>Date: {formatDate(data?.detail?.created_at)}</p>
                        <p>Farmer name: {data?.detail?.farmer_name}</p>
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
                        {data?.list?.map((veg, index) => {
                            return (
                                <tr key={index}>
                                    <td scope="col">{veg?.veg_name}</td>
                                    <td scope="col" className="text-end">{veg?.quantity}</td>
                                    <td scope="col" className="text-end">{(veg?.amount / veg?.quantity)?.toFixed(2)}</td>
                                    <td scope="col" className="text-end">{veg?.amount}</td>
                                </tr>
                            )
                        })}

                    </tbody>
                </table>

                <div className="row align-items-center">
                    <div className="col-6 text-start">
                        <h5>Payment Status: {status()}</h5>
                    </div>
                    <div className="col-6 text-end">
                        <p className="mb-0">Commission: {data?.detail?.total_commission || 0}</p>
                        <p className="mb-0">Magamai: {data?.detail?.total_magamai || 0}</p>
                        <p className="mb-0">Coolie: {data?.detail?.total_farmer_wage || 0}</p>
                        <p className="mb-0">Rent: {data?.detail?.total_farmer_rent || 0}</p>
                        <p className="mb-0">Advance: {data?.detail?.total_farmer_advance || 0}</p>
                        <p className="fw-bold">
                            Total:{data?.detail?.total_farmer_amount}
                            {/* {
                                Number(data?.detail?.total_amount || 0) -
                                ((Number(data?.detail?.total_commission || 0)) +
                                    (Number(data?.detail?.total_farmer_wage || 0)) +
                                    (Number(data?.detail?.total_magamai || 0)) +
                                    (Number(data?.detail?.total_farmer_rent || 0))
                                )
                            } */}
                        </p>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Add Payment to Farmer</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closePaymentModal}
                                ></button>
                            </div>

                            <form onSubmit={handlePaymentSubmit}>
                                <div className="modal-body">
                                    <div className='d-flex gap-2'>
                                        <p className="mb-3 text-danger fw-bold">Payment due: ₹{max || 0}</p>
                                        <p className="mb-3 text-success fw-bold">Advance: ₹{advanceRupee || 0}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Transaction Type</label>
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="transactionType"
                                                    id="paymentOption"
                                                    value="payment"
                                                    checked={transactionType === "payment"} // Payment checked by default
                                                    onChange={(e) => setTransactionType(e.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="paymentOption">
                                                    Payment
                                                </label>
                                            </div>
                                            {max > 0 ? "" :
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="transactionType"
                                                        id="advanceOption"
                                                        value="advance"
                                                        checked={transactionType === "advance"}
                                                        onChange={(e) => setTransactionType(e.target.value)}
                                                    />
                                                    <label className="form-check-label" htmlFor="advanceOption">
                                                        Advance
                                                    </label>
                                                </div>}
                                        </div>
                                    </div>


                                    <div className="mb-3">
                                        <label className="form-label">
                                            {transactionType === "payment" ? "Payment Amount (₹)" : "Advance Amount (₹)"}
                                        </label>
                                        {transactionType === "payment" &&
                                            <>
                                                <input
                                                    type="number"
                                                    onWheel={(e) => e.target.blur()}
                                                    value={paymentAmount}
                                                    onChange={handlePayment}
                                                    className="form-control payment-input"
                                                    placeholder="Enter payment amount"
                                                    required
                                                />

                                                {error && <p className="text-danger mb-2">{error}</p>}
                                            </>
                                        }
                                        {transactionType === "advance" &&
                                            <input
                                                type="number"
                                                onWheel={(e) => e.target.blur()}
                                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                                className="form-control payment-input"
                                                placeholder="Enter advance amount"
                                                required
                                            />}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closePaymentModal}
                                    >
                                        Cancel
                                    </button>
                                    {transactionType === "payment" &&
                                        <button type="submit" className="submit-btn py-2" disabled={!paymentAmount}>
                                            {spinAdd ? <Spinner /> :
                                                <>
                                                    Submit Payment
                                                </>}
                                        </button>}

                                    {transactionType === "advance" &&
                                        <button type="submit" className="submit-btn py-2" disabled={!advanceAmount}>
                                            {spinAdd ? <Spinner /> :
                                                <>
                                                    Submit Advance
                                                </>}
                                        </button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className={successMsg === null ? "alert_net hide_net" : "alert_net show alert_suc_bg"}>
                <FaCircleCheck className='exclamation-circle' />
                <span className="msg">{successMsg}</span>
                <div className="close-btn close_suc">
                    <IoClose className='close_mark' size={26} />
                </div>
            </div>

            <div className={errMsg === null ? "alert_net hide_net" : "alert_net show alert_war_bg"} >
                <RxCrossCircled className='exclamation-circle' />
                <span className="msg">{errMsg}</span>
                <div className="close-btn close_war">
                    <IoClose className='close_mark' size={26} />
                </div>
            </div>
        </>
    );
};

export default MultiFarmer;
