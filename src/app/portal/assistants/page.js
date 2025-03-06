"use client"
import { addAssistantsAPI, deleteAssistantAPI, editAssistantInfoAPI, getAllAssistantsAPI, getUserAPI } from '@/src/Components/Api';
import Spinner from '@/src/Components/Spinner';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { FaUserEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IoCloseCircleOutline } from 'react-icons/io5';
import { FiAlertTriangle } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import Loader from '@/src/Components/Loader';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import AccessDenied from '@/src/Components/AccessDenied';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import ModalBoxError from '@/src/Components/ModalBoxError';

const Assistants = () => {
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false)
    const user = useSelector((state) => state?.user?.userDetails)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const [isOffCanvasOpenEdit, setIsOffCanvasOpenEdit] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm();
    const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, reset: reset2, setError: setError2, clearErrors: clearErrors2 } = useForm();
    const [editUser, setEditUser] = useState(null)
    const phonePattern = /^[0-9]{10}$/;
    const [spinAdd, setSpinAdd] = useState(false)
    const [searchQuery, setSearchQuery] = useState("");
    const [removeId, setRemoveId] = useState(null)
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const router = useRouter()
    const filteredData = tableData?.filter((item) =>
        item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user_mobile?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAssistants = async () => {
        setLoading(true)
        const response = await getAllAssistantsAPI()
        if (response?.status === 200) {
            setTableData(response.data);
            setLoading(false)
        }
        else {
            setErrMsg(response.message)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
            setLoading(false)
        }
    }

    const onSubmitAssistant = async (data) => {

        const isSelected = data.inventory || data.sales || data.accounts;

        if (!isSelected) {
            setError('role', { type: 'manual', message: 'At least one role must be selected' });
            return;
        }

        clearErrors('role');
        setSpinAdd(true)

        const payload = {
            name: data?.name,
            mobile: data?.mobile,
            access: {
                inventory: data.inventory,
                sales: data.sales,
                accounts: data.accounts
            },
            role: "assistant",
            password: data?.mobile
        }

        const response = await addAssistantsAPI(payload)

        if (response?.status === 200) {

            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                getAssistants()
                setSuccessMsg(null)
                setIsOffCanvasOpen(false)
                reset()
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            setSpinAdd(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)

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

    const onEditAssistant = async (data) => {
        const isSelected = data.inventory || data.sales || data.accounts;

        if (!isSelected) {
            setError2('role', { type: 'manual', message: 'At least one role must be selected' });
            return;
        }

        clearErrors2('role');

        setSpinAdd(true)

        const payload = {
            name: data?.name,
            mobile: data?.mobile,
            access: {
                inventory: data.inventory,
                sales: data.sales,
                accounts: data.accounts
            },
        }
        const response = await editAssistantInfoAPI(editUser?.user_id, payload)

        if (response?.status === 200) {

            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                getAssistants()
                setSuccessMsg(null)
                setIsOffCanvasOpenEdit(false)
                reset2()
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            setSpinAdd(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)

        }

    }


    const openEditCanvas = (user) => {
        setEditUser(user)
        reset2(user)
        setIsOffCanvasOpenEdit(true)
        setShowAlert(false)
        setRemoveId(null)
        setIsOffCanvasOpen(false)
    }

    const roleChange = (e) => {
        clearErrors2("role")
        setEditUser({ ...editUser, access: { ...editUser.access, [e.target.name]: e.target.checked } })
    }

    const removeUserDetails = async () => {
        setLoading(true)
        setShowAlert(false)
        const response = await deleteAssistantAPI(removeId)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setTimeout(() => {
                setRemoveId(null)
                getAssistants()
                setSuccessMsg(null)
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            setLoading(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }
    }

    const showWarning = (id) => {
        setShowAlert(true)
        setRemoveId(id)
        setIsOffCanvasOpenEdit(false)
        setIsOffCanvasOpen(false)
    }

    const closeWarning = () => {
        setShowAlert(false)
        setRemoveId(null)
    }

    const handleCloseError = () => {
        setErrMsg(null)
    }

    useEffect(() => {
        getAssistants()
    }, [])
    return (
        <div className='app-container'>
            {user?.user_role === "marketer" ?
                <>
                    {loading ? <Loader /> :
                        <>
                            <div className='head pt-2 mb-2 d-flex align-items-center justify-content-between'>
                                <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                <h2 className='primary-color text-center flex-grow-1 m-0'>
                                    {translations[app_language]?.assistantDirectory}
                                </h2>
                            </div>

                            <div className='d-flex justify-content-end mt-4'>
                                {sub_status ? <button className='submit-btn py-2 px-2' onClick={() => setIsOffCanvasOpen(true)}>{translations[app_language]?.addAssistant}</button> : ""}
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
                                    filteredData?.map((v, i) => {
                                        const accessRoles = Object.keys(v?.access)
                                            .filter(key => v.access[key])
                                            .join(", ");
                                        return (
                                            <div className='col-md-6 col-lg-4' key={i}>

                                                <div className="profile-card card border-0 rounded-4 p-4 m-3">
                                                    <div className="profile-header">
                                                        <div className='d-flex align-items-center justify-content-between w-100'>
                                                            <h3 className="profile-name">{v?.user_name}</h3>
                                                            <div className='edit-assistant'><FaUserEdit size={24} className={sub_status ?'pointer primary-color' : 'disabled primary-color'}  onClick={() => openEditCanvas(v)} /> /
                                                                <button type='button' className='border-0 ps-1 bg-white primary-color' disabled={!sub_status} onClick={() => showWarning(v?.user_id)}> <RiDeleteBin5Fill size={24} /></button></div>
                                                        </div>
                                                        <div className="profile-shop">
                                                            {accessRoles}
                                                        </div>
                                                    </div>

                                                    <div className="profile-info">
                                                        <div className="profile-mobile">
                                                            <FaMobileScreenButton />
                                                            {v?.user_mobile}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)
                                    }))
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
                                    <h5 id="offcanvasRightLabel">{translations[app_language]?.addAssistant}</h5>
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
                                                    onSubmit={handleSubmit(onSubmitAssistant)}
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
                                                                required: "Please enter the Assistant's name",
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
                                                                required: "Please enter the Assistant's Mobile number",
                                                                pattern: {
                                                                    value: phonePattern,
                                                                    message: "Incorrect phone number",
                                                                },
                                                            })}

                                                        />
                                                        <p className="err-dev">{errors?.mobile?.message}</p>
                                                    </div>

                                                    <div className="form-group">
                                                        <div className="">
                                                            <label className='pb-2 primary-color'>
                                                                {translations[app_language]?.selectRole}<sup className="super">*</sup>
                                                            </label>
                                                            <div className='role-input'>
                                                                <label>
                                                                    <input type="checkbox" {...register('inventory')} className='me-2' onChange={() => clearErrors("role")} />
                                                                    {translations[app_language]?.inventoryManager}
                                                                </label>
                                                                <br />

                                                                <label>
                                                                    <input type="checkbox" {...register('sales')} className='me-2' onChange={() => clearErrors("role")} />
                                                                    {translations[app_language]?.salesManager}
                                                                </label>
                                                                <br />

                                                                <label>
                                                                    <input type="checkbox" {...register('accounts')} className='me-2' onChange={() => clearErrors("role")} />
                                                                    {translations[app_language]?.accountsManager}
                                                                </label>
                                                            </div>
                                                            <p className="err-dev">{errors?.role?.message}</p>
                                                        </div>


                                                    </div>

                                                    <div className="d-flex justify-content-center mt-5">
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
                                    <h5 id="offcanvasRightLabel">{translations[app_language]?.editAssistant}</h5>
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
                                                    onSubmit={handleSubmit2(onEditAssistant)}
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
                                                            {...register2("name", {
                                                                required: "Please enter the Assistant's name",
                                                                onChange: (e) => setEditUser({ ...editUser, user_name: e.target.value })
                                                            })}
                                                            value={editUser?.user_name}
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
                                                                required: "Please enter the Assistant's Mobile number",
                                                                onChange: (e) => setEditUser({ ...editUser, user_mobile: e.target.value }),
                                                                pattern: {
                                                                    value: phonePattern,
                                                                    message: "Incorrect phone number",
                                                                },
                                                            })}
                                                            value={editUser?.user_mobile}

                                                        />
                                                        <p className="err-dev">{errors2?.mobile?.message}</p>
                                                    </div>

                                                    <div className="form-group">
                                                        <div className="">
                                                            <label className='pb-2 primary-color'>
                                                                {translations[app_language]?.selectRole}<sup className="super">*</sup>
                                                            </label>
                                                            <div className='role-input'>
                                                                <label>
                                                                    <input type="checkbox" {...register2('inventory', {
                                                                    })} className='me-2'
                                                                        checked={editUser?.access?.inventory || false} onChange={roleChange} />
                                                                    {translations[app_language]?.inventoryManager}
                                                                </label>
                                                                <br />

                                                                <label>
                                                                    <input type="checkbox" {...register2('sales')} className='me-2' checked={editUser?.access?.sales || false} onChange={roleChange} />
                                                                    {translations[app_language]?.salesManager}
                                                                </label>
                                                                <br />

                                                                <label>
                                                                    <input type="checkbox" {...register2('accounts')} className='me-2' checked={editUser?.access?.accounts || false} onChange={roleChange} />
                                                                    {translations[app_language]?.accountsManager}
                                                                </label>
                                                            </div>
                                                            <p className="err-dev">{errors2?.role?.message}</p>
                                                        </div>


                                                    </div>

                                                    <div className="d-flex justify-content-center mt-5">
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
                                                    <h4 className="modal-title w-100">{translations[app_language]?.areYouSure}?</h4>
                                                </div>
                                            </div>
                                            <div className="modal-body">
                                                <p className='text-center'>{translations[app_language]?.confirmWarning} {translations[app_language]?.assistantDelete}</p>
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

                            <ModalBoxError errMsg={errMsg} onClose={handleCloseError} />


                            {/* <div className={errMsg === null ? "alert_net hide_net" : "alert_net show alert_war_bg"} >
                                <RxCrossCircled className='exclamation-circle' />
                                <span className="msg">{errMsg}</span>
                                <div className="close-btn close_war">
                                    <IoClose className='close_mark' size={26} />
                                </div>
                            </div> */}
                        </>
                    }
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

export default Assistants