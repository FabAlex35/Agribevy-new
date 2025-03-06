"use client"
import React, { useEffect, useState } from 'react'
import { IoMdDownload } from "react-icons/io";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { IoMdPricetags } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { getFarmerSummaryDetailsAPI } from '@/src/Components/Api';
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import Loader from '@/src/Components/Loader';
import { useSearchParams } from 'next/navigation';
const Info = ({ params }) => {
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState(null)
    const [item, setItem] = useState(null);
    const searchParams = useSearchParams();
    const productDetails = {
        name: "Product name",
        tradedStock: "60 Kg",
        proposedPrice: "100/Kg",
        marketer: "Hariharan",
        tradedDate: "22-02-2024",
        transactions: [
            {
                id: 1,
                soldStock: "50kg",
                soldDate: "30-03-2024",
                soldPrice: "120/kg",
                paymentStatus: "paid"
            },
            {
                id: 2,
                soldStock: "50kg",
                soldDate: "30-03-2024",
                soldPrice: "120/kg",
                paymentStatus: "pending"
            }
        ]
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAllDetails = async () => {
        setLoading(true)
        const response = await getFarmerSummaryDetailsAPI(params.sales)
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
        getAllDetails()
    }, [])

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                setItem(JSON.parse(decodeURIComponent(data)));
            } catch (error) {
                console.error("Failed to parse item data:", error);
            }
        }
    }, [searchParams]);
    // console.log(item);
    
    return (
        <div className='app-container'>
            {loading ?
                <Loader /> :
                <>
                    <div className="farmer_details_wrapper">
                        {/* Main Product Card */}
                        <div className="farmer_details_main_card">
                            <div className="farmer_details_header">
                                <h2>{item?.veg_name}</h2>
                            </div>

                            <div className="farmer_details_stats">
                                <div className="farmer_details_stat_item">
                                    <div className="farmer_details_stat_icon"><MdOutlineProductionQuantityLimits /></div>
                                    <div className="farmer_details_stat_info">
                                        <span>Traded Stock</span>
                                        <strong>{item?.quantity}</strong>
                                    </div>
                                </div>

                                <div className="farmer_details_stat_item">
                                    <div className="farmer_details_stat_icon"><IoMdPricetags /></div>
                                    <div className="farmer_details_stat_info">
                                        <span>Price</span>
                                        <strong>{item?.proposed_price}{item?.unit==="kg"?"/kg":""}</strong>
                                    </div>
                                </div>

                                <div className="farmer_details_stat_item">
                                    <div className="farmer_details_stat_icon"><FaUserAlt /></div>
                                    <div className="farmer_details_stat_info">
                                        <span>Marketer</span>
                                        <strong>{item?.user_name}</strong>
                                    </div>
                                </div>

                                <div className="farmer_details_stat_item">
                                    <div className="farmer_details_stat_icon"><FaRegCalendarAlt /></div>
                                    <div className="farmer_details_stat_info">
                                        <span>Trade Date</span>
                                        <strong>{formatDate(item?.created_at)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Cards */}
                        <h4>Sale Summary</h4>
                        <div className="farmer_details_transactions">
                            {details?.map((transaction, index) => (
                                <div key={index} className="farmer_details_transaction_card">
                                    <div className="farmer_details_transaction_header">
                                        
                                        {/* <button className="farmer_details_invoice_btn">
                                            <LiaFileInvoiceSolid /> View Invoice
                                        </button> */}
                                    </div>

                                    <div className="farmer_details_transaction_grid">
                                        <div className="farmer_details_grid_item">
                                            <label>Sold Stock</label>
                                            <p>{transaction?.quantity}</p>
                                        </div>

                                        <div className="farmer_details_grid_item">
                                            <label>Sold Date</label>
                                            <p>{formatDate(transaction?.created_at)}</p>
                                        </div>

                                        <div className="farmer_details_grid_item">
                                            <label>Sold Price</label>
                                            <p>{transaction?.farmer_amount}</p>
                                        </div>

                                        <div className="farmer_details_grid_item">
                                            <label>Payment Status</label>
                                            <p className={`farmer_details_status ${transaction.farmer_status === 'paid' ? 'paid' : 'pending'
                                                }`}>
                                                {transaction.farmer_status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
        </div>
    )
}

export default Info