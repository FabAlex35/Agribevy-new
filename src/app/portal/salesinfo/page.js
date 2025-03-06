"use client"
import { getFarmerSalesAPI } from '@/src/Components/Api'
import Loader from '@/src/Components/Loader'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import AccessDenied from '@/src/Components/AccessDenied'
import { useSelector } from 'react-redux'
const Sales = () => {
  const user = useSelector((state) => state?.user?.userDetails)
  const router = useRouter()
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

  const getAllDetails = async () => {
    setLoading(true)
    const response = await getFarmerSalesAPI()
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

  const getStatusValue = (status) => {
    switch (status?.toLowerCase()) {
      case 'sold':
        return 'Sold';
      case 'partly_sold':
        return 'Partly sold';
      case 'unsold':
        return 'Unsold';
      default:
        return 'Unsold';
    }
  };

  useEffect(() => {
    getAllDetails()
  }, [])

  return (
    <div className='app-container'>
      {user?.user_role === "farmer" ?
        <>
          {loading ?
            <Loader /> :
            <>
              <div className="farmer-dashboard">
                <div className='head pt-2 text-center mb-4'>
                  <h2 className='primary-color'>My Sales</h2>
                </div>

                <div className="farmer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {details?.map((item, index) => (
                    <div key={index} className="farmer-card">
                      {(item?.status !== "unsold") &&
                        <div className="farmer-overlay d-flex justify-content-center align-items-center pointer" onClick={() => router.push(`/portal/salesinfo/${item?.product_id}?data=${encodeURIComponent(JSON.stringify(item))}`)}>
                          <span className="text-white fw-bold">Click to view more</span>
                        </div>}
                      <div className="farmer-card-header">
                        <h2 className="text-xl font-semibold mb-0">{item?.veg_name}</h2>
                      </div>

                      <div className="farmer-card-body ">
                        <div className="farmer-card-info space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-semibold">{item?.quantity} Kg</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold">₹{item?.proposed_price}{item?.unit === "kg" ? "/Kg" : ""}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Marketer:</span>
                            <span className="font-semibold">{item?.user_name}</span>
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
                          <span className={`badge ${(item?.payment) === "paid" ? 'bg-success' : item?.payment === "partly_paid" ? "bg-warning" : 'bg-danger'}`}>
                            {(item?.payment) === "paid" ? 'Paid' : item?.payment === "partly_paid" ? "Partly paid" : 'Unpaid'}
                          </span>
                        </div>

                        <div className="d-flex align-items-center">
                          <span className="me-2">Status:</span>
                          <span className={`badge ${(item?.status === "sold") ? 'bg-success' : item?.status === "unsold" ? "bg-danger" : 'bg-warning'}`}>
                            {getStatusValue(item.status)}
                          </span>
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
        </>
        :
        <>
          {user ?
            <AccessDenied /> : <Loader />}
        </>
      }
    </div>
  )
}

export default Sales