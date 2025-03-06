"use client"
import React, { useEffect, useState } from 'react'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import { getBuyerPurchasesAPI } from '@/src/Components/Api';
import Loader from '@/src/Components/Loader';
const Buyer = () => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const [data, setData] = useState([
    {
      "product": "Potato",
      "stock": 500,
      "proposed_price": 20,
      "traded_date": "2024-08-20",
      "current_status": "sold",
      "status": "Sold",
      "marketer": "Mukesh Kumar"
    },
    {
      "product": "Tomato",
      "stock": 300,
      "proposed_price": 25,
      "traded_date": "2024-08-21",
      "current_status": "partly_sold",
      "status": "Partly sold",
      "marketer": "Manikandan"
    },
    {
      "product": "Onion",
      "stock": 400,
      "proposed_price": 30,
      "traded_date": "2024-08-22",
      "current_status": "unsold",
      "status": "Unsold",
      "marketer": "Manickham"
    },
    {
      "product": "Cauliflower",
      "stock": 200,
      "proposed_price": 35,
      "traded_date": "2024-08-23",
      "current_status": "sold",
      "status": "Sold",
      "marketer": "Hariharan"
    },
    {
      "product": "Spinach",
      "stock": 150,
      "proposed_price": 15,
      "traded_date": "2024-08-24",
      "current_status": "partly_sold",
      "status": "Partly sold",
      "marketer": "Ram kumar"
    },
    {
      "product": "Brinjal",
      "stock": 250,
      "proposed_price": 28,
      "traded_date": "2024-08-25",
      "current_status": "unsold",
      "status": "Unsold",
      "marketer": "Satya"
    }
  ]
  )

  const getAllDetails = async () => {
    setLoading(true)
    const response = await getBuyerPurchasesAPI()
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
  return (
    <div className='app-container'>
      {loading ?
        <Loader /> :
        <>
          <div className="farmer-dashboard">
            <div className='head pt-2 text-center mb-4'>
              <h2 className='primary-color'>My Purchases</h2>
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
                          <span className="text-gray-600">Marketer:</span>
                          <span className="font-semibold">{item?.marketer_name}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold">{formatDate(item?.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="farmer-card-footer p-3">
                      {/* <button className={`text-center py-1 px-3 rounded-full border-0 status_btn ${getStatusClass(item.status)}`} disabled={item.status === "unsold"} onClick={() => router.push("/portal/salesinfo/info")}>{getStatusValue(item.status)}</button> */}

                      <div className="d-flex align-items-center">
                        <span className="me-2">Payment:</span>
                        <span className={`badge ${(item?.buyer_status) === "paid" ? 'bg-success' : item?.buyer_status === "partly_paid" ? "bg-warning" : 'bg-danger'}`}>
                          {(item?.buyer_status) === "paid" ? 'Paid' : item?.buyer_status === "partly_paid" ? "Partly paid" : 'Unpaid'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center">
                        <span className="me-2">Invoice</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              :
              <p className='text-danger fw-bold fs-3 text-center mt-5'>No records found</p>
            }
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

export default Buyer