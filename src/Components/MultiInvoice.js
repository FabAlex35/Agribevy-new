"use client";
import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { updateInvoiceAPI } from './Api';
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

const MultiInvoice = ({ data, getInvoice, language }) => {

    const [errMsg, setErrMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [paymentAmount, setPaymentAmount] = useState(data?.detail?.total_farmer_amount);
    const [spinAdd, setSpinAdd] = useState(false)
    const [max, setMax] = useState(null)
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const path = data?.detail.logo.split('\\')
    const imgPath = `http://localhost:3000/api/images/${path[path.length - 1]}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const [transactionType, setTransactionType] = useState("fullpayment")

    const handlePayment = (e) => {

        const value = e.target.value;;
        if (Number(value) > Number(max)) {
            setError(`Amount cannot exceed ${max ? max : 0}`);
            setPaymentAmount(max);
        } else {
            setError("");
            setPaymentAmount(value);
        }

    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSpinAdd(true)
        const payload = {
            payment: paymentAmount,
            phone: data?.detail.farmer_mobile,
            name: data?.detail.farmer_name
        }

        const response = await updateInvoiceAPI(decodeURIComponent(data?.detail?.invoiceId), payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                if (getInvoice) {
                    getInvoice(data?.detail?.invoiceId);
                }
                setSuccessMsg(null)
                setIsModalOpen(false);
                setPaymentAmount('');
                setMax(null)
                // getFarmerDetails()
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    };

    const closePaymentModal = () => {
        setIsModalOpen(false)
        setTransactionType("fullpayment")
        setError("")
        setPaymentAmount(max)
    }

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

    const setFullPayment = (e) => {
        setTransactionType(e.target.value)
        setPaymentAmount(data?.detail?.total_farmer_amount)
    }

    const setPartialPayment = (e) => {
        setTransactionType(e.target.value)
        setPaymentAmount("")
    }

    useEffect(() => {
        setMax(data?.detail.total_farmer_payment)
        setPaymentAmount(data?.detail.total_farmer_payment)
    }, [])
    
    return (
        <>
            <div className="text-end mt-2">
                <button onClick={downloadInvoiceAsPDF} className="btn submit-btn requirement-btn me-2">
                    Download
                </button>
                <button onClick={printInvoice} className="btn submit-btn requirement-btn me-2">
                    Print
                </button>
                {status() !== "Paid" &&
                    <button className="btn submit-btn requirement-btn me-2" onClick={() => {
                        setIsModalOpen(true)
                    }}>
                        Pay
                    </button>}
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
                        <p className="mb-0">{language === "tamil" ? "பில் எண்" : "Bill No"}: {data?.detail?.invoiceId}</p>
                        <p>{language === "tamil" ? "தேதி" : "Date"}: {formatDate(data?.detail?.created_at)}</p>
                        <p>{language === "tamil" ? "பெயர்" : "Farmer name"}: {data?.detail?.farmer_name}</p>
                    </div>
                </div>

                <table className="table border border-dark mb-4">
                    <thead>
                        <tr>
                            <th scope="col" className="text-center">
                                {language === "tamil" ? "விலை" : "Price"}
                            </th>
                            <th scope="col">{language === "tamil" ? "விபரம்" : "Item"}</th>
                            <th scope="col" className="text-center">
                                {language === "tamil" ? "எடை" : "Weight"}
                            </th>
                            <th scope="col" className="text-center">
                                {language === "tamil" ? "மொத்த எடை" : "Total Weight"}
                            </th>
                            <th scope="col" className="text-end">
                                {language === "tamil" ? "மொத்த தொகை" : "Total Amount"}
                            </th>
                        </tr>
                    </thead>
                    {/* <tbody>
                        {Object.values(
                            data?.list?.reduce((acc, veg) => {                               
                                if (!acc[veg.tamil_name]) {
                                    acc[veg.tamil_name] = {
                                        ...veg,
                                        quantities: [],
                                        price: [],
                                        totalWeight: 0,
                                        totalAmount: 0
                                    };
                                }
                                acc[veg.tamil_name].quantities.push(veg.quantity);
                                acc[veg.tamil_name].price.push(veg.amount/veg.quantity);
                                acc[veg.tamil_name].totalWeight += veg.quantity;
                                acc[veg.tamil_name].totalAmount += veg.amount;
                                return acc;
                            }, {})
                        ).map((groupedVeg, index) => {
                            return (
                                <tr key={index}>
                                    <td className="text-center">
                                        {(groupedVeg.amount / groupedVeg.quantity).toFixed(2)}
                                    </td>
                                    <td>{language === "tamil" ? groupedVeg.tamil_name : groupedVeg.veg_name}</td>
                                    <td className="text-center">
                                        {groupedVeg.quantities.map((w, i) => (
                                            <React.Fragment key={i}>
                                                {w}
                                                {i < groupedVeg.quantities.length - 1 && ","} 
                                                {(i + 1) % 5 === 0 && <br />} 
                                            </React.Fragment>
                                        ))}
                                    </td>
                                    <td className="text-center">{groupedVeg.totalWeight.toFixed(2)}</td>
                                    <td className="text-end">{groupedVeg.totalAmount.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody> */}
                    {/* <tbody>
    {Object.values(
        data?.list?.reduce((acc, veg) => {                               
            const key = `${veg.tamil_name}-${veg.amount / veg.quantity}`; 
            if (!acc[key]) {
                acc[key] = {
                    ...veg,
                    quantities: [],
                    price: [],
                    totalWeight: 0,
                    totalAmount: 0
                };
            }
            acc[key].quantities.push(veg.quantity);
            acc[key].price.push(veg.amount / veg.quantity);
            acc[key].totalWeight += veg.quantity;
            acc[key].totalAmount += veg.amount;
            return acc;
        }, {})
    ).map((groupedVeg, index) => {
        return (
            <tr key={index}>
                <td className="text-center">
                    {(groupedVeg.price[0]).toFixed(2)}
                </td>
                <td>{language === "tamil" ? groupedVeg.tamil_name : groupedVeg.veg_name}</td>
                <td className="text-center">
                    {groupedVeg.quantities.map((w, i) => (
                        <React.Fragment key={i}>
                            {w}
                            {i < groupedVeg.quantities.length - 1 && ","} 
                            {(i + 1) % 5 === 0 && <br />} 
                        </React.Fragment>
                    ))}
                </td>
                <td className="text-center">{groupedVeg.totalWeight.toFixed(2)}</td>
                <td className="text-end">{groupedVeg.totalAmount.toFixed(2)}</td>
            </tr>
        )
    })}
</tbody> */}
                    <tbody>
                        {Object.values(
                            data?.list?.reduce((acc, veg) => {
                                const key = `${veg.tamil_name}-${(veg.amount / veg.quantity).toFixed(2)}`;
                                if (!acc[key]) {
                                    acc[key] = {
                                        tamil_name: veg.tamil_name,
                                        veg_name: veg.veg_name,
                                        price: (veg.amount / veg.quantity).toFixed(2),
                                        quantities: [],
                                        totalWeight: 0,
                                        totalAmount: 0
                                    };
                                }
                                acc[key].quantities.push(veg.quantity);
                                acc[key].totalWeight += veg.quantity;
                                acc[key].totalAmount += veg.amount;
                                return acc;
                            }, {})
                        )
                            .sort((a, b) =>
                                a.tamil_name.localeCompare(b.tamil_name) || a.price - b.price
                            )
                            .map((groupedVeg, index) => (
                                <tr key={index}>
                                    <td className="text-center">{groupedVeg.price}</td>
                                    <td>{language === "tamil" ? groupedVeg.tamil_name : groupedVeg.veg_name}</td>
                                    <td className="text-center">
                                        {groupedVeg.quantities.map((w, i) => (
                                            <React.Fragment key={i}>
                                                {w}
                                                {i < groupedVeg.quantities.length - 1 && ", "}
                                                {(i + 1) % 5 === 0 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </td>
                                    <td className="text-center">{groupedVeg.totalWeight.toFixed(2)}</td>
                                    <td className="text-end">{groupedVeg.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="4" className="text-end">
                                <strong>{language === "tamil" ? "மொத்தம்" : "Total"}</strong>
                            </td>
                            <td className="text-end">
                                {data?.list?.reduce((total, veg) => total + (veg?.amount || 0), 0).toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="row align-items-end">
                    <div className="col-6 text-start">
                        <p className="mb-0">{language === "tamil" ? "கமிஷன்" : "Commission"}: {Number(data?.detail?.total_commission || 0).toFixed(2)}</p>
                        <p className="mb-0">{language === "tamil" ? "கூலி" : "Coolie"}: {Number(data?.detail?.total_farmer_wage || 0).toFixed(2)}</p>
                        <p className="mb-0">{language === "tamil" ? "வாடகை" : "Rent"}: {Number(data?.detail?.total_farmer_rent || 0).toFixed(2)}</p>
                        {data?.detail?.magamai_show ?
                        (<p className="mb-0">{language === "tamil" ? "மகமை" : "Magamai"}: {Number(data?.detail?.total_magamai || 0).toFixed(2)}</p>) : "" }
                        <p className="mb-0">{language === "tamil" ? "ரொக்கம்" : "Advance"}: {Number(data?.detail?.total_farmer_advance || 0).toFixed(2)}</p>
                        <hr />
                        <p className="fw-bold">
                            {language === "tamil" ? "மொத்தம்" : "Total"}: {(
                                Number(data?.detail?.total_commission || 0) +
                                Number(data?.detail?.total_magamai || 0) +
                                Number(data?.detail?.total_farmer_wage || 0) +
                                Number(data?.detail?.total_farmer_rent || 0) +
                                Number(data?.detail?.total_farmer_advance || 0)
                            ).toFixed(2)}
                        </p>
                    </div>

                    <div className="col-6 text-end">
                        <p className="fw-bold">
                            {language === "tamil" ? "துணை மொத்தம்" : "Sub Total"}: {(Number(data?.detail?.total_farmer_amount || 0) - Number(data?.detail?.total_sack_price || 0)).toFixed(2)}
                        </p>
                        <p className="mb-0">{language === "tamil" ? "சாக்கு விலை" : "Sack price"}: {Number(data?.detail?.total_sack_price || 0).toFixed(2)}</p>

                        <p className="fw-bold pt-3">{language === "tamil" ? "மொத்தம்" : "Total"}: {Number(data?.detail?.total_farmer_amount || 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="col-12 text-start" style={{ paddingTop: "80px", paddingBottom: "50px" }}>
                    <h5>{language === "tamil" ? "கட்டண நிலை" : "Payment Status"}: {status()}</h5>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Pay this bill</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closePaymentModal}
                                ></button>
                            </div>

                            <form onSubmit={handlePaymentSubmit}>
                                <div className="modal-body">
                                    <div className='d-flex gap-2'>
                                        <p className="mb-3 text-danger fw-bold">Total Payment due: ₹{max || 0}</p>
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
                                                    value="fullpayment"
                                                    checked={transactionType === "fullpayment"}
                                                    onChange={setFullPayment}
                                                />
                                                <label className="form-check-label" htmlFor="paymentOption">
                                                    Full Payment
                                                </label>
                                            </div>

                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="transactionType"
                                                    id="advanceOption"
                                                    value="partialpayment"
                                                    checked={transactionType === "partialpayment"}
                                                    onChange={setPartialPayment}
                                                />
                                                <label className="form-check-label" htmlFor="advanceOption">
                                                    Partial payment
                                                </label>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="mb-3">
                                        <label className="form-label">
                                            Bill  Payment Amount (₹)
                                        </label>

                                        <input
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            value={paymentAmount}
                                            onChange={handlePayment}
                                            className="form-control payment-input"
                                            placeholder="Enter payment amount"
                                            disabled={transactionType === "fullpayment"}
                                            required
                                        />

                                        {error && <p className="text-danger mb-2">{error}</p>}


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

                                    <button type="submit" className="submit-btn py-2" disabled={!paymentAmount}>
                                        {spinAdd ? <Spinner /> :
                                            <>
                                                Submit Payment
                                            </>}
                                    </button>

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

export default MultiInvoice;
