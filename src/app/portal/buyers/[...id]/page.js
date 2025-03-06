"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { getBuyerDetailsAPI, getBuyerDetailsFilterAPI, paymentUpdateAPI, updateMultipleTransactionAPI, updateSingleTransactionAPI } from '@/src/Components/Api'
import InvoiceBuyer from '@/src/Components/InvoiceBuyer'
import Spinner from '@/src/Components/Spinner'
import DashboardCard from '@/src/Components/DashboardCard'
import { useRouter } from 'next/navigation'

const BuyerDetails = ({ params }) => {

    const user = useSelector((state) => state?.user?.userDetails)
    const language = useSelector((state) => state?.user?.language)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenSingle, setIsModalOpenSingle] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('')
    const [details, setDetails] = useState(null)
    const [invoiceData, setInvoiceData] = useState(null)
    const [isClosing, setIsClosing] = useState(false);
    const [farmerModalOpen, setFarmerModalOpen] = useState(null)
    const [filterDate, setFilterDate] = useState(null)
    const [filterDateStart, setFilterDateStart] = useState(null)
    const [initial, setInitial] = useState(null)
    const [max, setMax] = useState(null)
    const [filtering, setFiltering] = useState(false)
    const [transactionType, setTransactionType] = useState("payment")
    const [paymentAmountSingle, setPaymentAmountSingle] = useState('');
    const [maxSingle, setMaxSingle] = useState('');
    const [errorSingle, setErrorSingle] = useState("");
    const [paymentAmountMulti, setPaymentAmountMulti] = useState('');
    const [maxMulti, setMaxMulti] = useState('');
    const [errorMulti, setErrorMulti] = useState("");
    const [spinAdd, setSpinAdd] = useState(false)
    const [advanceRupee, setAdvanceRupee] = useState(null)
    const [error, setError] = useState("");
    const [totalPayment, setTotalPayment] = useState(null)
    const [multiple, setMultiple] = useState(false)
    const [multiId, setMultiId] = useState([])
    const [singleId, setSingleId] = useState(null)
    const [multiValue, setMultiValue] = useState([])
    const [multiModal, setMultiModal] = useState(false)
    const router = useRouter()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const handlePayment = (e) => {
        const value = e.target.value;
        if (value > max) {
            setError(`Amount cannot exceed ${max ? max : 0}`);
            setPaymentAmount(max);
        } else {
            setError("");
            setPaymentAmount(value);
        }

    }

    const filterData = async () => {
        setFiltering(true)
        setLoading(true)
        const response = await getBuyerDetailsFilterAPI(params.id[1], filterDateStart, filterDate)
        if (response?.status === 200) {
            setDetails(response?.data)
            setLoading(false)
        }
        else {
            setErrMsg(response.message)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
            setLoading(false)
        }

    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSpinAdd(true)
        let payload

        if (transactionType === "payment") {
            payload = {
                payment: paymentAmount
            }
        }
        else {
            payload = {
                advance: advanceAmount
            }
        }

        const response = await paymentUpdateAPI("buyer", params.id[1], payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)

            setTimeout(() => {
                setSuccessMsg(null)
                setIsModalOpen(false);
                setTransactionType("payment")
                setPaymentAmount('');
                setAdvanceAmount('');
                setAdvanceRupee(null)
                setMax(null)
                getBuyerDetails()
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
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };


    const getBuyerDetails = async () => {
        setLoading(true)
        const response = await getBuyerDetailsAPI(params.id[1])
        if (response?.status === 200) {
            setFiltering(false)
            setFilterDate("")
            setFilterDateStart("")
            setDetails(response?.data?.transactions)
            setLoading(false)
            setInitial(response?.data?.transactions)
            setPaymentAmount(response?.data?.totalAmount)
            setMax(response?.data?.totalAmount)
            setAdvanceRupee(response?.data?.totalAdvance)
            setTotalPayment(response?.data?.sum)

        }
        else if (response?.status === 404) {
            setDetails(null)
            setInitial(null)
            setLoading(false)
        }
        else {
            setErrMsg(response.message)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
            setLoading(false)
        }
    }

    const showModal = (obj) => {
        setFarmerModalOpen(true);
        setIsClosing(false);
        setInvoiceData(obj)
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => setFarmerModalOpen(false), 300);
    };

    const closePaymentModalSingle = () => {
        setIsModalOpenSingle(false)
        setErrorSingle("")
        setPaymentAmountSingle(maxSingle)
    }
    const handlePaymentSingle = (e) => {
        const value = e.target.value;
        if (value > maxSingle) {
            setErrorSingle(`Amount cannot exceed ${maxSingle ? maxSingle : 0}`);
            setPaymentAmountSingle(maxSingle);
        } else {
            setErrorSingle("");
            setPaymentAmountSingle(value);
        }

    }

    const handlePaymentMulti = (e) => {
        const value = e.target.value;
        if (value > maxMulti) {
            setErrorMulti(`Amount cannot exceed ${maxMulti ? maxMulti : 0}`);
            setPaymentAmountMulti(maxMulti);
        } else {
            setErrorMulti("");
            setPaymentAmountMulti(value);
        }

    }
    const closePaymentModalMulti = () => {
        setMultiModal(false)
        setErrorMulti("")
        setPaymentAmountMulti(maxMulti)
    }

    const handlePaymentSubmitSingle = async (e) => {
        e.preventDefault();
        setSpinAdd(true)
        const payload = {
            role: "buyer",
            payment: paymentAmountSingle,
            id: singleId,
            phone: params.id[1],
            name: decodeURIComponent(params.id[0])
        }
        const response = await updateSingleTransactionAPI(payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setIsModalOpenSingle(false);
                setPaymentAmountSingle('');
                setMaxSingle(null)
                setSingleId(null)
                getBuyerDetails()
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    const handlePaymentSubmitMulti = async (e) => {
        e.preventDefault();
        setSpinAdd(true)
        const payload = {
            role: "buyer",
            payment: paymentAmountMulti,
            id: multiId,
            phone: params.id[1],
            name: decodeURIComponent(params.id[0])
        }
        const response = await updateMultipleTransactionAPI(payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setMultiModal(false);
                setMultiple(false)
                setMultiId([])
                setMultiValue([])
                setPaymentAmountMulti('');
                setMaxMulti(null)
                getBuyerDetails()
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    const openPayment = (transaction) => {
        setIsModalOpenSingle(true)
        setPaymentAmountSingle(transaction?.buyer_payment)
        setMaxSingle(transaction?.buyer_payment)
        setSingleId(transaction?.transaction_id)
    }

    useEffect(() => {
        getBuyerDetails()
    }, [])

    const showAll = () => {
        getBuyerDetails()
    }

    const closePaymentModal = () => {
        setIsModalOpen(false)
        setTransactionType("payment")
        setPaymentAmount(max)
        setError("")
    }

    const enableMultiple = () => {
        setMultiple(!multiple)
        setMultiId([])
        setMaxMulti(null)
        setPaymentAmountMulti('')
        setMultiValue([])
    }

    const addId = (e, idd, transaction) => {
        if (e.target.checked) {
            // Add multiple ids and transactions
            setMultiId((prevState) => [...prevState, ...idd]);
            setMultiValue((prevState) => [...prevState, transaction]);
        } else {
            // Remove multiple ids and transactions
            setMultiId((prevState) =>
                prevState.filter((id) => !idd.includes(id))
            );
            setMultiValue((prevState) => {
                const transactions = prevState.filter((pay) => pay.transaction_id !== idd)
                return transactions
            }
            )
        }
    };


    const payMultiple = () => {
        const totalValue = multiValue?.reduce((acc, cv) => {
            return acc + Number(cv.buyer_payment);
        }, 0);
        setMultiModal(true)
        setMaxMulti(totalValue)
        setPaymentAmountMulti(totalValue)
    }
    return (
        <div className='app-container'>
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts || user?.access?.sales)) ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/buyers")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {decodeURIComponent(params.id[0])} - {translations[app_language]?.transactions}
                                    </h2>
                                </div>

                                <div className='d-flex justify-content-end mt-4'>

                                    {sub_status ? <button className='submit-btn py-2 px-2' onClick={() => setIsModalOpen(true)}>{translations[app_language]?.addTransaction}</button> : ""}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                    <DashboardCard
                                        title={translations[app_language]?.totalPayment}
                                        value={totalPayment || 0}
                                        symbol="₹"

                                    />
                                    <DashboardCard
                                        title={translations[app_language]?.pendingPayment}
                                        value={max || 0}
                                        symbol="₹"

                                    />
                                </div>

                                <div className='d-flex flex-column flex-md-row justify-content-between flex-wrap mt-2 align-items-start align-items-md-center'>
                                    <div className='d-flex flex-column flex-md-row justify-content-start gap-3 align-items-center mb-3 mb-md-0'>
                                        <input type='date' className='date-inp ' onChange={(e) => setFilterDateStart(e.target.value)} value={filterDateStart} max={new Date().toISOString().split('T')[0]} />
                                        <div className='primary-color fw-bold'>To</div>
                                        <input type='date' className='date-inp ' onChange={(e) => setFilterDate(e.target.value)} value={filterDate} max={new Date().toISOString().split('T')[0]} />
                                        <button className='submit-btn requirement-btn py-2 px-2 mt-2 mt-md-0' onClick={filterData} disabled={!(filterDate && filterDateStart)}>{translations[app_language]?.filter}</button>
                                    </div>
                                    <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2'>
                                        <div className="d-flex flex-column flex-md-row gap-2">
                                            {multiple ?
                                                <div className='d-flex flex-column flex-md-row gap-2 mt-2 mt-lg-0'>
                                                    <button className='submit-btn py-2 px-2' onClick={payMultiple} >{translations[app_language]?.getPayment}</button>
                                                    <button className='submit-btn py-2 px-2' onClick={enableMultiple} >{translations[app_language]?.cancel}</button>
                                                </div>
                                                :
                                                (sub_status ? <button className='submit-btn py-2 px-2' onClick={enableMultiple} >{translations[app_language]?.multiplePayment}</button> : "")
                                            }
                                        </div>
                                        {filtering &&
                                            <button className='submit-btn py-2 px-2 mt-2 mt-md-0' onClick={showAll}>{translations[app_language]?.resetFilter}</button>}
                                    </div>
                                </div>

                                {details ?
                                    <div className="pt-4 overview_container ">
                                        <div className="row g-4">
                                            {details?.length > 0 ?
                                                <>
                                                    {details
                                                        .sort((a, b) => (new Date(b?.soldDate) - new Date(a?.soldDate)))
                                                        .map(transaction => {
                                                            // const path = transaction?.image?.split('\\')
                                                            // const ImageURL = `http://localhost:3000/api/images/${path[path?.length - 1]}`
                                                            return (
                                                                <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={transaction.id}>
                                                                    <div className="card border rounded-lg p-4 hover-shadow transition-shadow postion-relative h-100">
                                                                        {(multiple && transaction?.buyer_status !== "paid") ?
                                                                            <input className='payment-badge p-1' type='checkbox' onChange={(e) => addId(e, transaction?.transaction_id, transaction)} />
                                                                            :
                                                                            <span className={`badge payment-badge ${transaction?.buyer_status === "paid" ? 'bg-success' : 'bg-danger'}`}>
                                                                                {transaction?.buyer_status === "paid" ? 'Paid' : 'Unpaid'}
                                                                            </span>}

                                                                        <span className="d-flex pay-date justify-content-between small text-muted">
                                                                            <p>{formatDate(transaction?.soldDate)}</p>
                                                                        </span>
                                                                        {/* <div className="invoice-overlay d-flex justify-content-center align-items-center pointer" onClick={() => showModal(transaction)}>
                                                                            <span className="text-white fw-bold">Click to view invoice</span>
                                                                        </div> */}


                                                                        <div className="d-flex gap-3 flex-column flex-md-row">
                                                                            {/* <img
                                                                                src={`${baseUrl}/${transaction?.image}`}
                                                                                alt={transaction?.veg_name}
                                                                                className="img-fluid w-25 h-25 rounded object-cover"
                                                                            /> */}
                                                                            {/* <img
                                                                                src={ImageURL}
                                                                                alt={transaction?.veg_name}
                                                                                className="img-fluid  uniform-image  rounded object-cover mb-3 mb-md-0"
                                                                            /> */}
                                                                            <div>
                                                                                <h3 className="fw-bold h6 ">{language === "tamil" ? transaction?.tamil_name : transaction?.veg_name}</h3>
                                                                                <p className="text-muted mb-1 quantity"> {transaction?.quantity} kg</p>
                                                                                <p className=" primary-color fw-bold">
                                                                                    ₹{transaction.buyer_amount}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-4 mb-2 pt-3 border-top d-flex justify-content-between align-items-center ">
                                                                            {/* <div className="d-flex justify-content-between small text-muted">
                                                                                <p>{formatDate(transaction?.soldDate)}</p>
                                                                            </div> */}

                                                                            {/* <div className="d-flex align-items-center">
                                                                                <span className="me-2">Payment:</span>
                                                                                <span className={`badge ${transaction?.buyer_status === "paid" ? 'bg-success' : 'bg-danger'}`}>
                                                                                    {transaction?.buyer_status === "paid" ? 'Paid' : 'Unpaid'}
                                                                                </span>
                                                                            </div> */}
                                                                        </div>

                                                                        <div className='d-flex flex-wrap justify-content-between'>
                                                                            <button className={`col-12 col-md-5 invoice-buyer ${app_language !== "english" ? "small-font" : ""}`} onClick={() => showModal(transaction)}>  {translations[app_language]?.invoice}</button>
                                                                            {transaction?.buyer_status !== "paid" &&
                                                                                <button className='col-12 col-md-5 primary-bg-color text-white pay-buyer mt-2 mt-md-0' onClick={() => openPayment(transaction)}>{translations[app_language]?.getPayment}</button>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </>
                                                :
                                                <div className='text-center fs-2 fw-bold text-danger mt-5'>{translations[app_language]?.noRecords}</div>
                                            }
                                        </div>



                                    </div>
                                    :
                                    <div className='text-center fs-2 fw-bold text-danger mt-5'>{translations[app_language]?.noRecords}</div>
                                }
                                {isModalOpen && (
                                    <div className="modal fade show d-block" tabIndex="-1">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title fw-bold">{translations[app_language]?.addPaymentBuyer}</h5>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        onClick={closePaymentModal}
                                                    ></button>
                                                </div>

                                                <form onSubmit={handlePaymentSubmit}>
                                                    <div className="modal-body">
                                                        <div className='d-flex gap-2'>
                                                            <p className="mb-3 text-danger fw-bold">{translations[app_language]?.paymentDue}: {max || 0}</p>
                                                            <p className="mb-3 text-success fw-bold">{translations[app_language]?.advance}: {advanceRupee || 0}</p>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">{translations[app_language]?.transactionType}</label>
                                                            <div>
                                                                <div className="form-check form-check-inline">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="transactionType"
                                                                        id="paymentOption"
                                                                        value="payment"
                                                                        checked={transactionType === "payment"}
                                                                        onChange={(e) => setTransactionType(e.target.value)}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="paymentOption">
                                                                        {translations[app_language]?.gettingPayment}
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
                                                                            {translations[app_language]?.advance}
                                                                        </label>
                                                                    </div>}
                                                            </div>
                                                        </div>


                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                {transactionType === "payment" ? translations[app_language]?.gettingAmount + "(₹)" : translations[app_language]?.advance + "(₹)"}
                                                            </label>
                                                            {transactionType === "payment" &&
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        onWheel={(e) => e.target.blur()}
                                                                        value={paymentAmount}
                                                                        onChange={handlePayment}
                                                                        className="form-control payment-input"
                                                                        placeholder={translations[app_language]?.gettingAmount}
                                                                        required
                                                                    />
                                                                    {error && <p className="text-danger mb-2">{error}</p>}</>}
                                                            {transactionType === "advance" &&
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                                                    className="form-control payment-input"
                                                                    placeholder={translations[app_language]?.enterAdvance}
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
                                                            {translations[app_language]?.cancel}
                                                        </button>
                                                        {transactionType === "payment" &&
                                                            <button type="submit" className="submit-btn py-2" disabled={!paymentAmount}>
                                                                {spinAdd ? <Spinner /> :
                                                                    <>
                                                                        {translations[app_language]?.submit}
                                                                    </>}
                                                            </button>}

                                                        {transactionType === "advance" &&
                                                            <button type="submit" className="submit-btn py-2" disabled={!advanceAmount}>
                                                                {spinAdd ? <Spinner /> :
                                                                    <>
                                                                        {translations[app_language]?.submit}
                                                                    </>}
                                                            </button>}
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {farmerModalOpen && (
                                    <div className={`modal d-block modal-fullscreen ${isClosing ? 'fade-out' : 'fade-in'}`} tabIndex="-1">
                                        <InvoiceBuyer data={invoiceData} closeModal={closeModal} language={language} />
                                    </div>

                                )}
                                {isModalOpenSingle && (
                                    <div className="modal fade show d-block" tabIndex="-1">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title fw-bold">{translations[app_language]?.gettingPayment}</h5>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        onClick={closePaymentModalSingle}
                                                    ></button>
                                                </div>

                                                <form onSubmit={handlePaymentSubmitSingle}>
                                                    <div className="modal-body">
                                                        <div className='d-flex gap-2'>
                                                            <p className="mb-3 text-danger fw-bold">{translations[app_language]?.paymentDue}: ₹{maxSingle}</p>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                {translations[app_language]?.gettingAmount + "(₹)"}
                                                            </label>

                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                value={paymentAmountSingle}
                                                                onChange={handlePaymentSingle}
                                                                className="form-control payment-input"
                                                                placeholder={translations[app_language]?.gettingAmount + "(₹)"}
                                                                required
                                                            />

                                                            {errorSingle && <p className="text-danger mb-2">{errorSingle}</p>}


                                                        </div>
                                                    </div>

                                                    <div className="modal-footer">
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={closePaymentModalSingle}
                                                        >
                                                            {translations[app_language]?.cancel}
                                                        </button>

                                                        <button type="submit" className="submit-btn py-2" disabled={!paymentAmountSingle}>
                                                            {spinAdd ? <Spinner /> :
                                                                <>
                                                                    {translations[app_language]?.submit}
                                                                </>}
                                                        </button>

                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {multiModal && (
                                    <div className="modal fade show d-block" tabIndex="-1">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title fw-bold">{translations[app_language]?.gettingPayment}</h5>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        onClick={closePaymentModalMulti}
                                                    ></button>
                                                </div>

                                                <form onSubmit={handlePaymentSubmitMulti}>
                                                    <div className="modal-body">
                                                        <div className='d-flex gap-2'>
                                                            <p className="mb-3 text-danger fw-bold">{translations[app_language]?.paymentDue}: ₹{maxMulti}</p>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                {translations[app_language]?.gettingAmount + "(₹)"}
                                                            </label>

                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                value={paymentAmountMulti}
                                                                onChange={handlePaymentMulti}
                                                                className="form-control payment-input"
                                                                placeholder={translations[app_language]?.gettingAmount + "(₹)"}
                                                                required
                                                            />

                                                            {errorMulti && <p className="text-danger mb-2">{errorMulti}</p>}


                                                        </div>
                                                    </div>

                                                    <div className="modal-footer">
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={closePaymentModalMulti}
                                                        >
                                                            {translations[app_language]?.cancel}
                                                        </button>

                                                        <button type="submit" className="submit-btn py-2" disabled={!paymentAmountMulti}>
                                                            {spinAdd ? <Spinner /> :
                                                                <>
                                                                    {translations[app_language]?.submit}
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
                            </>}
                </>
                :
                <>
                    {user ?
                        <AccessDenied /> : <Loader />}
                </>}
        </div>
    )
}

export default BuyerDetails