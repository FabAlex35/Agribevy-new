"use client"
import { addFarmerAPI, deleteFarmerAPI, getFarmerAPI, searchFarmerAPI, updateFarmerAPI } from '@/src/Components/Api';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import Loader from '@/src/Components/Loader';
import Spinner from '@/src/Components/Spinner';
import { useSelector } from 'react-redux';
import AccessDenied from '@/src/Components/AccessDenied';
import { FaLocationDot } from "react-icons/fa6";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaUserEdit } from 'react-icons/fa';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle } from 'react-icons/fi';
const Farmer = () => {
    const user = useSelector((state) => state?.user?.userDetails)
    const app_language = useSelector((state) => state?.user?.app_language)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(true)
    const phonePattern = /^[0-9]{10}$/;
    const [searchQuery, setSearchQuery] = useState("");
    const [spinAdd, setSpinAdd] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [removeId, setRemoveId] = useState(null)
    const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, reset: reset2 } = useForm();
    const [editUser, setEditUser] = useState(null)
    const [isOffCanvasOpenEdit, setIsOffCanvasOpenEdit] = useState(false)
    const router = useRouter()
    const translations = useSelector((state) => state?.language?.translations)

    const filteredData = tableData?.filter((item) =>
        item.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmer_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmer_mobile?.includes(searchQuery)
    );


    const onSubmitFarmer = async (data) => {
        setSpinAdd(true)
        const response = await addFarmerAPI(data)

        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setIsOffCanvasOpen(false)
                reset()
                getFarmerList()
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

    const getFarmerList = async () => {
        setLoading(true)
        const response = await getFarmerAPI()

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

    const closeFunc = () => {
        reset()
        setIsOffCanvasOpen(false)
    }
    const closeFunc2 = () => {
        reset2()
        setIsOffCanvasOpenEdit(false)
    }


    const openEditCanvas = (e, user) => {
        e.stopPropagation()
        setEditUser(user)
        reset2({
            name: user?.farmer_name,
            mobile: user?.farmer_mobile,
            address: user?.farmer_address
        })
        setIsOffCanvasOpenEdit(true)
        setIsOffCanvasOpen(false)
        setShowAlert(false)
        setRemoveId(null)
    }

    const showWarning = (e, id) => {
        e.stopPropagation()
        setShowAlert(true)
        setIsOffCanvasOpenEdit(false)
        setIsOffCanvasOpen(false)
        setRemoveId(id)
    }

    const closeWarning = () => {
        setShowAlert(false)
        setRemoveId(null)
    }

    const removeUserDetails = async () => {
        setLoading(true)
        setShowAlert(false)
        const response = await deleteFarmerAPI(removeId)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setTimeout(() => {
                setRemoveId(null)
                getFarmerList()
                setSuccessMsg(null)
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            setLoading(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }


    const onEditFarmer = async (data) => {
        setSpinAdd(true)
        const response = await updateFarmerAPI(data.mobile, data)

        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setIsOffCanvasOpenEdit(false)
                reset2()
                getFarmerList()
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
        getFarmerList()
    }, [])
    return (
        <div className='app-container'>
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts || user?.access?.inventory)) ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {translations[app_language]?.farmerDirectory}
                                    </h2>
                                </div>

                                <div className='d-flex justify-content-end mt-4'>
                                    {sub_status ? 
                                    <button className='submit-btn py-2 px-2' onClick={() => setIsOffCanvasOpen(true)}>{translations[app_language]?.addFarmer}</button>
                                    : "" }
                                </div>

                                <div className='d-flex justify-content-end mt-3' >

                                    <input
                                        type="text"
                                        className=' search-input'
                                        placeholder={translations[app_language]?.search}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className='row mt-3'>
                                    {filteredData?.length > 0 ? (
                                        filteredData?.map((v, i) => (
                                            <div className='col-md-6 col-lg-4' key={i}>
                                                {/* <Link href={} > */}
                                                <div className="profile-card card border-0 rounded-4 p-4 m-3 pointer" onClick={() => router.push(`/portal/farmers/${v.farmer_name}/${v.farmer_mobile}`)}>
                                                    <div className="profile-header">
                                                        <div className="d-flex align-items-center justify-content-between w-100">
                                                            <h3 className="profile-name">{v?.farmer_name}</h3>
                                                            <div className='edit-assistant'>
                                                                <FaUserEdit size={24} className={sub_status ?'pointer primary-color' : 'disabled primary-color'}
                                                                onClick={(e) => openEditCanvas(e, v)} /> /
                                                                <button type='button' 
                                                                disabled={!sub_status}
                                                                className='border-0 ps-1 bg-white primary-color' onClick={(e) => showWarning(e, v?.farmer_mobile)}> <RiDeleteBin5Fill size={24} /></button>
                                                            </div>

                                                        </div>
                                                        <div className="profile-shop">
                                                            <div className="profile-icon">
                                                                <FaLocationDot />
                                                            </div>
                                                            {v?.farmer_address}
                                                        </div>
                                                    </div>

                                                    <div className="profile-info">
                                                        <div className="profile-mobile">
                                                            <FaMobileScreenButton />
                                                            {v?.farmer_mobile}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* </Link> */}
                                            </div>)))
                                        :
                                        <p className='text-danger fw-bold fs-3 text-center'>{translations[app_language]?.noRecords}</p>
                                    }
                                </div>


                                <div
                                    className={`offcanvas offcanvas-end ${isOffCanvasOpen ? "show" : ""}`}
                                    tabindex="-1"
                                    id="offcanvasRight"
                                    aria-labelledby="offcanvasRightLabel"
                                >
                                    <div className="offcanvas-header">
                                        <h5 id="offcanvasRightLabel">{translations[app_language]?.addFarmer}</h5>
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

                                                <div className="login-sign-form-section">
                                                    <form
                                                        className="login-sign-form mt-4"
                                                        onSubmit={handleSubmit(onSubmitFarmer)}
                                                    >
                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.nickName}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"

                                                                name="name"
                                                                className="form-control"
                                                                {...register("name", {
                                                                    required: "Please enter the Farmer's Nick name",
                                                                })}
                                                            />
                                                            <p className="err-dev">{errors?.name?.message}</p>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.mobileNumber}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                onInput={(e) => {
                                                                    if (e.target.value.length > 10) {
                                                                        e.target.value = e.target.value.slice(0, 10)
                                                                    }
                                                                }} onWheel={(e) => e.target.blur()}
                                                                name="mobile"
                                                                className="form-control"
                                                                {...register("mobile", {
                                                                    required: "Please enter the Farmer Mobile number",
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
                                                                    {translations[app_language]?.location}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"

                                                                name="address"
                                                                className="form-control"
                                                                {...register("address", {
                                                                    required: "Please enter the Farmer Location ",
                                                                })}
                                                            />
                                                            <p className="err-dev">{errors?.address?.message}</p>
                                                        </div>

                                                        <div className="d-flex justify-content-center mt-4">
                                                            <button
                                                                type="submit"
                                                                className="start_btn"
                                                            > {spinAdd ? <Spinner /> : translations[app_language]?.submit}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`offcanvas offcanvas-end ${isOffCanvasOpenEdit ? "show" : ""}`}
                                    id="offcanvasRight"
                                    aria-labelledby="offcanvasRightLabel"
                                >
                                    <div className="offcanvas-header">
                                        <h5 id="offcanvasRightLabel">{translations[app_language]?.editFarmer}</h5>
                                        <button
                                            type="button"
                                            className="btn-close text-reset"
                                            onClick={closeFunc2}
                                        ></button>
                                    </div>
                                    {/* ============ offcanvas create ====================== */}
                                    <div className="offcanvas-body">
                                        <div className="row canva">
                                            <div className="col-12 card-section">

                                                <div className="login-sign-form-section">
                                                    <form
                                                        className="login-sign-form mt-4"
                                                        onSubmit={handleSubmit2(onEditFarmer)}
                                                    >
                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.nickName}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"

                                                                name="name"
                                                                className="form-control"
                                                                {...register2("name", {
                                                                    required: "Please enter the Farmer's Nick name",
                                                                    onChange: (e) => setEditUser({ ...editUser, farmer_name: e.target.value })
                                                                })}
                                                                value={editUser?.farmer_name}
                                                            />
                                                            <p className="err-dev">{errors2?.name?.message}</p>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.mobileNumber}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                onInput={(e) => {
                                                                    if (e.target.value.length > 10) {
                                                                        e.target.value = e.target.value.slice(0, 10)
                                                                    }
                                                                }} onWheel={(e) => e.target.blur()}
                                                                name="mobile"
                                                                className="form-control"
                                                                {...register2("mobile", {
                                                                    required: "Please enter the Farmer Mobile number",
                                                                    pattern: {
                                                                        value: phonePattern,
                                                                        message: "Incorrect phone number",
                                                                    },
                                                                })}
                                                                value={editUser?.farmer_mobile}
                                                                disabled

                                                            />
                                                            <p className="err-dev">{errors2?.mobile?.message}</p>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.location}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"

                                                                name="address"
                                                                className="form-control"
                                                                {...register2("address", {
                                                                    required: "Please enter the Farmer Location ",
                                                                    onChange: (e) => setEditUser({ ...editUser, farmer_address: e.target.value })
                                                                })}
                                                                value={editUser?.farmer_address}
                                                            />
                                                            <p className="err-dev">{errors2?.address?.message}</p>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* toast  */}


                                <div className={`modal ${showAlert ? "show" : ""} col-5`}>
                                    <div className="modal-dialog">
                                        <div className="modal-dialog modal-confirm">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <div className="icon-box" onClick={closeWarning}>
                                                        <IoCloseCircleOutline className='close pointer' size={28} />
                                                    </div>
                                                    <div className="col-12 text-center">
                                                        <FiAlertTriangle size={40} className='text-danger' />
                                                    </div>
                                                    <div className="col-12">
                                                        <h4 className="modal-title w-100"> {translations[app_language]?.areYouSure}?</h4>
                                                    </div>
                                                </div>
                                                <div className="modal-body">
                                                    <p className='text-center'>{translations[app_language]?.confirmWarning} {translations[app_language]?.farmerDelete}</p>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-primary" onClick={closeWarning}>{translations[app_language]?.cancel}</button>

                                                    <button type="button" className="btn btn-secondary" onClick={removeUserDetails}>{translations[app_language]?.delete}</button>
                                                </div>
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

export default Farmer