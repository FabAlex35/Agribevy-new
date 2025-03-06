"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck, FaMobileScreenButton } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { addMarketerAPI, getMarketerAPI } from '@/src/Components/Api'
import Spinner from '@/src/Components/Spinner'
import Link from 'next/link'
import { BsShop } from 'react-icons/bs'
const Marketers = () => {
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false)
    const user = useSelector((state) => state?.user?.userDetails)
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [tableData, setTableData] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true)
    const [spinAdd, setSpinAdd] = useState(false)
    const phonePattern = /^[0-9]{10}$/;
  
    const filteredData = tableData?.filter((item) =>
      item?.marketer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.marketer_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.marketer_mobile?.includes(searchQuery)
    );

    const closeFunc = () => {
        reset()
        setIsOffCanvasOpen(false)
      }
      const onSubmitBuyer = async (data) => {
        setSpinAdd(true)
        const response = await addMarketerAPI(data)
    
        if (response?.status === 200) {
          setSuccessMsg(response?.message)
          setSpinAdd(false)
          setTimeout(() => {
            setSuccessMsg(null)
            setIsOffCanvasOpen(false)
            reset()
            getMarketerList()
            reset()
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

      const getMarketerList = async () => {
        setLoading(true)
        const response = await getMarketerAPI()
    
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
      
      useEffect(() => {
        getMarketerList()
      }, [])
  return (
    <div className='app-container'>
    {user?.user_role === "buyer"?
      <>
        {
          loading ?
            <Loader /> :
            <>
              <div className='head pt-2 text-center'>
                <h2 className='primary-color'>Marketers directory</h2>
              </div>

              <div className='d-flex justify-content-end mt-4'>
                <button className='submit-btn py-2' onClick={() => setIsOffCanvasOpen(true)}>Add Marketer</button>
              </div>

              <div className='d-flex justify-content-end mt-3' >
                <input
                  type="text"
                  className=' search-input'
                  placeholder='Search'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className='row mt-3'>
              {filteredData?.length > 0 ? (
                      filteredData?.map((v, i) => (
                <div className='col-md-6 col-lg-4' key={i}>
                  <Link href={`/portal/marketers/${v.marketer_name}/${v.marketer_mobile}`}>
                  <div className="profile-card card border-0 rounded-4 p-4 m-3">
                    <div className="profile-header">
                      <div className="d-flex align-items-center gap-4">
                        <div>
                          <h3 className="profile-name">{v?.marketer_name}</h3>
                          <div className="profile-shop">
                            <div className="profile-icon">
                              <BsShop />
                            </div>
                            {v?.marketer_address}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-info">
                      <div className="profile-mobile">
                        <FaMobileScreenButton />
                        {v?.marketer_mobile}
                      </div>
                    </div>
                  </div>
                  </Link>
                </div>)))
                :
                <p className='text-danger fw-bold fs-3 text-center'>No records found</p>
                      }
              </div>

              <div
                className={`offcanvas offcanvas-end ${isOffCanvasOpen ? "show" : ""}`}
                tabindex="-1"
                id="offcanvasRight"
                aria-labelledby="offcanvasRightLabel"
                title='createCanvas'
              >
                <div className="offcanvas-header">
                  <h5 id="offcanvasRightLabel">Add Marketer</h5>
                  <button
                    type="button"
                    className="btn-close text-reset"
                    onClick={closeFunc}
                  ></button>
                </div>
                {/* ============ offcanvas create ====================== */}
                <div className="offcanvas-body">
                  <div className="row canva">

                    <div className="col-12 card-section">

                      <>
                        <div className="login-sign-form-section">
                          <form
                            className="login-sign-form mt-4"
                            onSubmit={handleSubmit(onSubmitBuyer)}
                          >
                            <div className="form-group">
                              <div className="label-time">
                                <label>
                                  Nick Name<sup className="super">*</sup>
                                </label>
                              </div>
                              <input
                                type="text"

                                name="name"
                                className="form-control"
                                {...register("name", {
                                  required: "Please enter the Nick Name",
                                })}
                              />
                              <p className="err-dev">{errors?.name?.message}</p>
                            </div>

                            <div className="form-group">
                              <div className="label-time">
                                <label>
                                  Mobile number<sup className="super">*</sup>
                                </label>
                              </div>
                              <input
                                type="number"
                                onWheel={(e)=>e.target.blur()}
                                onInput={(e)=>{
                                  if(e.target.value.length>10)
                                  {
                                    e.target.value=e.target.value.slice(0,10)
                                  }
                                }}
                                name="mobile"
                                className="form-control"
                                {...register("mobile", {
                                  required: "Please enter the Marketer Mobile number",
                                  pattern: {
                                    value: phonePattern,
                                    message: "Incorrect phone number",
                                  },
                                })}

                              />
                              <p className="err-dev">{errors?.mobile?.message}</p>
                            </div>

                            <div className="form-group">
                              <div className="label-time">
                                <label>
                                  Shop name<sup className="super">*</sup>
                                </label>
                              </div>
                              <input
                                type="text"

                                name="address"
                                className="form-control"
                                {...register("address", {
                                  required: "Please enter the Marketer Shop name",
                                })}
                              />
                              <p className="err-dev">{errors?.address?.message}</p>
                            </div>

                            <div className="d-flex justify-content-center mt-4">
                              <button
                                type="submit"
                                className="start_btn"
                              > {spinAdd ? <Spinner /> : "Submit"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </>

                    </div>
                  </div>
                </div>
              </div>
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

export default Marketers