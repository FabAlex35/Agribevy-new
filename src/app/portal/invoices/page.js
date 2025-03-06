"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck, FaLocationDot, FaMobileScreenButton } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { getAllInvoicesAPI, getFarmerWithoutInvoiceAPI, getSingleInvoiceAPI } from '@/src/Components/Api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MultiInvoice from '@/src/Components/MultiInvoice'
const Invoices = () => {
    const user = useSelector((state) => state?.user?.userDetails)
    const language = useSelector((state) => state?.user?.language)
    const translations = useSelector((state) => state?.language?.translations)
    const app_language = useSelector((state) => state?.user?.app_language)
    const router = useRouter()
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tableData, setTableData] = useState(null);
    const [tableDataIn, setTableDataIn] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFarmerList = async () => {
        setLoading(true)
        const response = await getFarmerWithoutInvoiceAPI()

        if (response?.status === 200) {
            setTableData(response.data);
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

    const getInvoiceList = async () => {
        setLoading(true)
        const response = await getAllInvoicesAPI()
        if (response?.status === 200) {
            setTableDataIn(response?.data);
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

    const getInvoice = async (id) => {
        setLoading(true)
        const response = await getSingleInvoiceAPI(id)
        if (response?.status === 200) {
            setInvoiceData(response?.data);
            setLoading(false)
            setIsModalOpen(true)
        }
        else {
            setErrMsg(response.message)
            setIsModalOpen(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
            setLoading(false)
        }

    }


    const closeModal = () => {
        setTimeout(() => setIsModalOpen(false), 300);
    };

    useEffect(() => {
        getFarmerList()
        getInvoiceList()
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
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {translations[app_language]?.bills}
                                    </h2>
                                </div>
                       
                                <div className='d-flex justify-content-end mt-2 align-items-center'>
                                    <a href="#all" className='submit-btn py-2 text-center page-nav'>{translations[app_language]?.viewBills}</a>
                                </div>
                                {tableData?.length > 0 && (
                                    <h4 className='primary-color my-4 ps-2'>{translations[app_language]?.selectBills}</h4>)}

                                <div className='row mt-3 bill-bottom'>
                                    {tableData?.length > 0 ? (
                                        tableData?.map((v, i) => (
                                            <div className='col-md-6 col-lg-4' key={i}>
                                                <Link href={`/portal/invoices/${v.farmer_name}/${v.farmer_mobile}`} >
                                                    <div className="profile-card card border-0 rounded-4 p-4 m-3">
                                                        <div className="profile-header">
                                                            <div className="d-flex align-items-center gap-4">
                                                                <div>
                                                                    <h3 className="profile-name">{v?.farmer_name}</h3>
                                                                    <div className="profile-shop">
                                                                        <div className="profile-icon">
                                                                            <FaLocationDot />
                                                                        </div>
                                                                        {v?.farmer_address}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="profile-info">
                                                            <div className="profile-mobile">
                                                                <FaMobileScreenButton />
                                                                {v?.farmer_mobile}
                                                            </div>
                                                        </div>
                                                    </div></Link>
                                            </div>)))
                                        :
                                        <p className='text-danger fw-bold fs-3 text-center'>{translations[app_language]?.noBillRequest}</p>
                                    }
                                </div>
                                <section id='all'>
                                    <div className='head pt-2 text-center my-4'>
                                        <h2 className='primary-color'>{translations[app_language]?.allBills}</h2>
                                    </div>

                                    {tableDataIn?.length > 0 ?
                                        <div className='row mt-2'>
                                            {tableDataIn?.map((invoice, index) => {
                                                return (
                                                    <div className='col-12 col-md-6 col-lg-4 mt-4' key={index}>
                                                        <div className="pdf-card pointer " onClick={() => getInvoice(decodeURIComponent(invoice?.invoiceId))}>

                                                            <div className="pdf-header">
                                                                {translations[app_language]?.viewPdf}
                                                            </div>

                                                            <div className="card-body">
                                                                <h5 className="card-title mb-2">{invoice?.invoiceId}</h5>
                                                                <div className="card-text">
                                                                    <div className='mb-2'>
                                                                        <span>{translations[app_language]?.farmer}:{invoice?.farmer_name}</span>
                                                                    </div>

                                                                    <div className='mb-1'>
                                                                        <span>{translations[app_language]?.amount}: ₹{invoice?.total_farmer_amount}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="card-footer">
                                                                <small className="text-muted">{translations[app_language]?.date}:{formatDate(invoice?.created_at)}</small>
                                                            </div>
                                                        </div>
                                                    </div>)
                                            })}


                                        </div>
                                        :
                                        <p className='text-danger fw-bold fs-3 text-center mt-5'>{translations[app_language]?.noBills}</p>
                                    }

                                    {isModalOpen && (
                                        <div className={`modal d-block modal-fullscreen`} tabIndex="-1">
                                            <div className="modal-dialog modal-fullscreen">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title text-center">{translations[app_language]?.bill}</h5>
                                                        <button type="button" className="btn-close" onClick={closeModal}></button>
                                                    </div>
                                                    <div className="modal-body" >
                                                        <MultiInvoice data={invoiceData} getInvoice={getInvoice} language={language} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>



                                {/* toast  */}
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

export default Invoices