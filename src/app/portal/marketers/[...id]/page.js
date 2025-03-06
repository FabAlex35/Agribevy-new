"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { RxCrossCircled } from "react-icons/rx";
import { getMarketerDetailsAPI } from '@/src/Components/Api'

const MarketerProducts = ({ params }) => {

    const user = useSelector((state) => state?.user?.userDetails)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState(null)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMarketerDetails = async () => {
        setLoading(true)
        const response = await getMarketerDetailsAPI(params.id[1])
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

    useEffect(() => {
        getMarketerDetails()
    }, [])

    return (
        <div className='app-container'>
            {user?.user_role === "buyer" ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 text-center mb-4'>
                                    <h2 className='primary-color'>{decodeURIComponent(params.id[0])} - Transactions</h2>
                                </div>
                                {details?.length > 0 ?
                                    <div className="farmer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {details?.map((item, index) => (
                                            <div key={index} className="farmer-card">
                                                <div className="farmer-card-header">
                                                    <h2 className="text-xl font-semibold mb-0">{item?.veg_name}</h2>
                                                </div>

                                                <div className="farmer-card-body ">
                                                    <div className="farmer-card-info space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Quantity:</span>
                                                            <span className="font-semibold">{item?.quantity} Kg</span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Amount:</span>
                                                            <span className="font-semibold">₹{item?.buyer_amount}</span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Date:</span>
                                                            <span className="font-semibold">{formatDate(item?.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="farmer-card-footer p-3">

                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">Payment:</span>
                                                        <span className={`badge ${(item?.buyer_status) === "paid" ? 'bg-success' : item?.buyer_status === "partly_paid" ? "bg-warning" : 'bg-danger'}`}>
                                                            {(item?.buyer_status) === "paid" ? 'Paid' : item?.buyer_status === "partly_paid" ? "Partly paid" : 'Unpaid'}
                                                        </span>
                                                    </div>

                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    :
                                    <p className='text-danger fw-bold fs-3 text-center mt-5'>No records found</p>
                                }


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

export default MarketerProducts