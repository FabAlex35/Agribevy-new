"use client"
import { changePasswordAPI, editUserAPI, getUserAPI } from '@/src/Components/Api';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { MdOutlineEdit } from "react-icons/md";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import Loader from '@/src/Components/Loader';
import Spinner from '@/src/Components/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { changeName } from '@/src/app/features/Slice';
import { useRouter } from 'next/navigation';

const MyDetails = () => {
    const dispatch = useDispatch()
    const change = useSelector((state) => state?.user?.nameChanged)
    const translations = useSelector((state) => state?.language?.translations)
    const app_language = useSelector((state) => state?.user?.app_language)
    const [user, setUser] = useState(null)
    const [work, setWork] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editUser, setEditUser] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false)
    const [isOffCanvasOpen2, setIsOffCanvasOpen2] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [spin1, setSpin1] = useState(false)
    const [spin2, setSpin2] = useState(false)
    const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, reset: reset2, watch: watch2 } = useForm();


    const onSubmitUser = async (data) => {
        setSpin1(true)
        const response = await editUserAPI(data)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            dispatch(changeName(!change))
            setSpin1(false)
            setTimeout(() => {
                setSuccessMsg(null)
                reset()
                setIsOffCanvasOpen(false)
                getUserDetails()
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpin1(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }
    const onSubmitPassword = async (data) => {
        setSpin2(true)
        const response = await changePasswordAPI(data)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpin2(false)
            setTimeout(() => {
                setSuccessMsg(null)
                reset2()
                setIsOffCanvasOpen2(false)
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpin2(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }

    }

    const getUserDetails = async () => {
        setLoading(true)
        const response = await getUserAPI()
        if (response?.status === 200) {
            setUser(response?.data);
            setLoading(false)
            setEditUser(response?.data)
            if (response?.data?.user_role === "assistant") {
                const accessRoles = Object.keys(response?.data?.access)
                    .filter(key => response?.data.access[key])
                    .join(", ");
                setWork(accessRoles)
            }
            reset({
                name: response?.data?.user_name,
                mobile: response?.data?.user_mobile,
                address: response?.data?.user_address,
                market: response?.data?.market
            })
        }
        else {
            setErrMsg(response?.message)
            setLoading(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    useEffect(() => {
        getUserDetails()
    }, [])
    const router = useRouter()
    return (
        <div className='app-container'>
            {loading ? <Loader /> :
                <>
                    <div className='head pt-2 d-flex align-items-center justify-content-between'>
                        <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/dashboard")}>{translations[app_language]?.back}</button>
                    </div>
                    <div className='profile-sec sec-all'>
                        <div className='dash-container p-5'>
                            <div className='titel py-4'>
                                <h5>{translations[app_language]?.myAccount}</h5>
                            </div>
                            <div className='profile-detail'>
                                <div className='row'>
                                    <div className='col-md-8'>
                                        <div className='d-flex align-items-center gap-3'>
                                            <div className='profile-name'>
                                                <div className=''>
                                                    <h6>{user?.user_name
                                                    }</h6>
                                                    <p>{user?.user_role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-4'>

                                    </div>
                                </div>
                            </div>
                            <div className='profile-detail mt-4'>
                                <div className='row'>
                                    <div className='col-md-10'>
                                        <div className=''>
                                            <h6>{translations[app_language]?.personalInfo}</h6>
                                        </div>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className='line-height'>
                                                    <p>{translations[app_language]?.emptyName}</p>
                                                    <p className='profile-para'>{user?.user_name
                                                    }</p>
                                                    {user?.user_role !== "assistant" &&
                                                        <>
                                                            <p>{translations[app_language]?.location}</p>
                                                            <p className='profile-para'>{user?.user_address}</p>
                                                        </>
                                                    }
                                                    {user?.user_role === "assistant" &&
                                                        <>
                                                            <p>Incharge</p>
                                                            <p className='profile-para'>{work}</p>
                                                        </>
                                                    }

                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='line-height'>
                                                    <p>{translations[app_language]?.mobileNumber}</p>
                                                    <p className='profile-para'>{user?.user_mobile}</p>
                                                    {(user?.user_role === "marketer" || user?.user_role === "assistant") &&
                                                        <>
                                                            <p>{translations[app_language]?.market}</p>
                                                            <p className='profile-para'>{user?.market}</p>
                                                        </>}

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-2'>
                                        <div className='btn-end text-end'>
                                            <button onClick={() => setIsOffCanvasOpen(true)}><MdOutlineEdit />{translations[app_language]?.editInfo}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=' mt-4'>
                                <div className='row'>
                                    <div className='col-md-8'>
                                        <button className='submit-btn px-2 py-2' onClick={() => setIsOffCanvasOpen2(true)}>{translations[app_language]?.changePassword}</button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div
                        className={`offcanvas offcanvas-end ${isOffCanvasOpen ? "show" : ""}`}
                        tabindex="-1"
                        id="offcanvasRight"
                        aria-labelledby="offcanvasRightLabel"
                    >
                        <div className="offcanvas-header">
                            <h5 id="offcanvasRightLabel">{translations[app_language]?.editMyDetails}</h5>
                            <button
                                type="button"
                                className="btn-close text-reset"
                                onClick={() => setIsOffCanvasOpen(false)}
                            ></button>
                        </div>
                        {/* ============ offcanvas create ====================== */}
                        <div className="offcanvas-body">
                            <div className="row canva">
                                <div className="col-12 card-section">
                                    <div className="login-sign-form-section">

                                        <form
                                            className="login-sign-form mt-4"
                                            onSubmit={handleSubmit(onSubmitUser)}
                                        >
                                            <div className="form-group">
                                                <div className="label-time">
                                                    <label>
                                                        {translations[app_language]?.emptyName}<sup className="super">*</sup>
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"

                                                    name="name"
                                                    className="form-control"
                                                    {...register("name", {
                                                        required: "Please enter the name",
                                                        onChange: (e) => setEditUser({ ...editUser, user_name: e.target.value })
                                                    })}
                                                    value={editUser?.user_name}
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
                                                    type="text"

                                                    name="mobile"
                                                    className="form-control"
                                                    {...register("mobile")}
                                                    value={editUser?.user_mobile}
                                                    disabled

                                                />
                                                <p className="err-dev">{errors?.mobile?.message}</p>
                                            </div>
                                            {editUser?.user_role !== "assistant" &&
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
                                                            required: "Please enter the Location ",
                                                            onChange: (e) => setEditUser({ ...editUser, user_address: e.target.value })
                                                        })}
                                                        value={editUser?.user_address}
                                                    />
                                                    <p className="err-dev">{errors?.address?.message}</p>
                                                </div>}
                                            {editUser?.user_role === "marketer" &&
                                                <div className="form-group">
                                                    <div className="label-time">
                                                        <label>
                                                            {translations[app_language]?.market}<sup className="super">*</sup>
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text"

                                                        name="market"
                                                        className="form-control"
                                                        {...register("market", {
                                                            required: "Please enter the market",
                                                            onChange: (e) => setEditUser({ ...editUser, market: e.target.value })
                                                        })}
                                                        value={editUser?.market}
                                                    />
                                                    <p className="err-dev">{errors?.market?.message}</p>
                                                </div>}

                                            <div className="d-flex justify-content-center mt-4">
                                                <button
                                                    type="submit"
                                                    className="start_btn"
                                                > {spin1 ? <Spinner /> : translations[app_language]?.submit}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`offcanvas offcanvas-end ${isOffCanvasOpen2 ? "show" : ""}`}
                        tabindex="-1"
                        id="offcanvasRight2"
                        aria-labelledby="offcanvasRightLabel"
                    >
                        <div className="offcanvas-header">
                            <h5 id="offcanvasRightLabel">{translations[app_language]?.changePassword}</h5>
                            <button
                                type="button"
                                className="btn-close text-reset"
                                onClick={() => setIsOffCanvasOpen2(false)}
                            ></button>
                        </div>
                        {/* ============ offcanvas create ====================== */}
                        <div className="offcanvas-body">
                            <div className="row canva">
                                <div className="col-12 card-section">
                                    <div className="login-sign-form-section">

                                        <form
                                            className="login-sign-form mt-4"
                                            onSubmit={handleSubmit2(onSubmitPassword)}
                                        >
                                            <div className="form-group showpass">
                                                <label htmlFor="email">{translations[app_language]?.oldpassword}</label>
                                                <input type={show ? "text" : "password"} className="form-control" id="email" {...register2("password", {
                                                    required: "Please enter the Password"
                                                })} />
                                                {show ? (
                                                    <VscEyeClosed
                                                        className="eye2"
                                                        onClick={() => setShow(false)}
                                                    />
                                                ) : (<VscEye className="eye2" onClick={() => setShow(true)} />)}
                                                <p className="err-dev">{errors2.password?.message}</p>
                                            </div>

                                            <div className="form-group showpass">
                                                <label htmlFor="email">{translations[app_language]?.newPassword}</label>
                                                <input type={show2 ? "text" : "password"} className="form-control" id="email" {...register2("newPassword", {
                                                    required: "Please enter the New Password"
                                                })} />
                                                {show2 ? (
                                                    <VscEyeClosed
                                                        className="eye2"
                                                        onClick={() => setShow2(false)}
                                                    />
                                                ) : (<VscEye className="eye2" onClick={() => setShow2(true)} />)}
                                                <p className="err-dev">{errors2.newPassword?.message}</p>
                                            </div>

                                            <div className="form-group showpass">
                                                <label htmlFor="email">{translations[app_language]?.confirm}</label>
                                                <input type="password" className="form-control" id="email" {...register2("cnewPassword", {
                                                    required: "Please reenter the Password",
                                                    validate: (value) =>
                                                        value === watch2("newPassword") || "Passwords do not match",
                                                })} />
                                                <p className="err-dev">{errors2.cnewPassword?.message}</p>
                                            </div>

                                            <div className="d-flex justify-content-center mt-4">
                                                <button
                                                    type="submit"
                                                    className="start_btn"
                                                > {spin2 ? <Spinner /> : translations[app_language]?.submit}
                                                </button>
                                            </div>
                                        </form>
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
        </div>
    )
}

export default MyDetails