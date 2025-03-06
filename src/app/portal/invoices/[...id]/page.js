"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import Invoice from '@/src/Components/Invoice'
import Spinner from '@/src/Components/Spinner'
import { generateInvoiceAPI, generateInvoiceDetails, getSpecificFarmerWithoutInvoiceAPI } from '@/src/Components/Api'
import { useRouter } from 'next/navigation'
import { FiAlertTriangle } from 'react-icons/fi'
import Billmodify from '@/src/Components/Billmodify'
const InvoiceDetails = ({ params }) => {
    const user = useSelector((state) => state?.user?.userDetails)
    const language = useSelector((state) => state?.user?.language)
    const translations = useSelector((state) => state?.language?.translations)
    const app_language = useSelector((state) => state?.user?.app_language)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const billMode = useSelector((state) => state?.user?.bill)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState(null)
    const [noInvoice, setNoInvoice] = useState(false)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const [spinAdd, setSpinAdd] = useState(false)
    const router = useRouter()
    const [showAlert, setShowAlert] = useState(false)
    const [selectedBills, setSelectedBills] = useState([])
    const [billData, setBillData] = useState([])
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const [overlayVisible, setOverlayVisible] = useState([]);

    const handleOverlayToggle = (transaction_id) => {
        setOverlayVisible((prevState) => {
            const newOverlayVisible = prevState.includes(transaction_id)
                ? prevState.filter((id) => id !== transaction_id)
                : [...prevState, transaction_id];

            const transactionId = details?.map((detail) => detail?.transaction_id) || [];

            const areArraysEqual =
                newOverlayVisible.length === transactionId.length &&
                newOverlayVisible.every((id) => transactionId.includes(id));

            if (areArraysEqual) {
                setNoInvoice(true)
            } else {
                setNoInvoice(false)
            }
            setSelectedBills(newOverlayVisible)
            return newOverlayVisible;
        });
    };

    const selectAllCards = () => {
        const transactionId = details?.map(detail => { return detail?.transaction_id })
        setOverlayVisible(transactionId)
        setSelectedBills(transactionId)
        setNoInvoice(true)
    }

    const deselectAllCards = () => {
        setOverlayVisible([])
        setNoInvoice(false)
    }

    const getFarmerDetails = async () => {
        setLoading(true)
        const response = await getSpecificFarmerWithoutInvoiceAPI(params.id[1])
        if (response?.status === 200) {
            if (response?.data?.length) {
                setDetails(response?.data)
                setLoading(false)
            }
            else {
                router.push("/portal/invoices")
            }
        }
        else if (response?.status === 404) {
            setDetails(null)
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

    const showData = async () => {
        const response = await generateInvoiceDetails(selectedBills)
        if (response.status == 200) {
            setBillData(response.data)
        }
        setShowAlert(true)
    }

    const closeWarning = () => {
        setShowAlert(false)
    }

    const generateInvoice = async () => {
        setSpinAdd(true)
        const isShow = billMode?.type == "farmer" ? 1 : billMode?.show
        const data = {
            id: overlayVisible,
            mobile: params.id[1],
            show: isShow
        }
        const response = await generateInvoiceAPI(data)

        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                getFarmerDetails()
                setOverlayVisible([])
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    useEffect(() => {
        getFarmerDetails()
    }, [])


    return (
        <div className='app-container'>
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts || user?.access?.sales)) ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/invoices")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {decodeURIComponent(params.id[0])} - {translations[app_language]?.bills}
                                    </h2>
                                </div>

                                <div className='d-flex justify-content-between mt-4 align-items-center'>
                                    {sub_status ? (!noInvoice &&
                                        <button className='submit-btn py-2 px-2' onClick={selectAllCards}>{translations[app_language]?.selectAll}</button>) : ""}
                                    {noInvoice &&
                                        <button className='submit-btn py-2 px-2' onClick={deselectAllCards}>{translations[app_language]?.deselectAll}</button>}
                                    {sub_status ? <button className='submit-btn py-2' disabled={overlayVisible.length === 0} onClick={billMode?.bill_type == 'auto' ? generateInvoice : showData}>{spinAdd ? <Spinner /> : translations[app_language]?.generateBill}</button> : ""}
                                </div>

                                {details ?
                                    <div className="p-2 overview_container ">
                                        <div className="row g-4">
                                            {details?.length > 0 ?
                                                <>
                                                    {details
                                                        .sort((a, b) => (new Date(b?.created_at) - new Date(a?.created_at)))
                                                        .map(transaction => (
                                                            <div className="col-md-6 col-lg-4" key={transaction.transaction_id}>
                                                                <div className={`card border rounded-lg p-4 hover-shadow transition-shadow pointer invoice-card ${overlayVisible.includes(transaction.transaction_id) ? 'visible' : ''}`} onClick={() => handleOverlayToggle(transaction.transaction_id)}>

                                                                    <div className="d-flex">
                                                                        <div>
                                                                            <h3 className="fw-bold h5 mb-2">{language === "tamil" ? transaction?.tamil_name : transaction?.veg_name}</h3>
                                                                            <p className="text-muted mb-2">{translations[app_language]?.weight}: {transaction?.quantity} kg</p>
                                                                            <p className="primary-color fw-bold mb-2">
                                                                                ₹{transaction?.farmer_amount}
                                                                            </p>
                                                                        </div>
                                                                    </div>


                                                                    <div className="mt-3 pt-3 border-top">
                                                                        <div className="d-flex justify-content-between align-items-center mb-1">

                                                                            <div className="d-flex align-items-center">
                                                                                <span className="me-2">Payment:</span>
                                                                                <span className={`badge ${transaction?.farmer_status === "paid" ? 'bg-success' : 'bg-danger'}`}>
                                                                                    {transaction?.farmer_status === "paid" ? 'Paid' : 'Unpaid'}
                                                                                </span>
                                                                            </div>

                                                                            <div className="d-flex justify-content-between small text-muted ">
                                                                                <p className="mb-0"> {translations[app_language]?.emptyDate}: {formatDate(transaction?.created_at)}</p>
                                                                            </div>

                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </>
                                                :
                                                <div className='text-center fs-2 fw-bold text-danger mt-5'> {translations[app_language]?.noRecords}</div>
                                            }
                                        </div>
                                    </div>
                                    :
                                    <div className='text-center fs-2 fw-bold text-danger mt-5'> {translations[app_language]?.noRecords}</div>
                                }

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

            <div className={`modal ${showAlert ? "show" : ""} col-5`}>
                <div className="modal-confirm bill-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="icon-box" onClick={closeWarning}>
                                <IoCloseCircleOutline className='close pointer' size={28} />
                            </div>
                        </div>
                        <>
                            <Billmodify data={billData} appLanguage={language} translations={translations} hideTransactionId={true} setShowAlert={setShowAlert} getFarmerDetails={getFarmerDetails} mobile={params.id[1]} setBillData={setBillData} billMode={billMode}/>
                        </>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceDetails