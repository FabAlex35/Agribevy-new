"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5'
import { addSackAPI, addSettingsAPI, addWageAPI, deleteSackAPI, deleteWageAPI, editSackAPI, editWageAPI, getMySettingsAPI, getSackAPI, getWageAPI, updateSettingsAPI } from '@/src/Components/Api'
import Spinner from '@/src/Components/Spinner'
import { changeLanguage, getBillMode } from '@/src/app/features/Slice'
import { CiEdit } from 'react-icons/ci'
import { MdDeleteOutline } from 'react-icons/md'
import { Modal, Button } from "react-bootstrap";
import { FiAlertTriangle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import ModalBoxError from '@/src/Components/ModalBoxError'
const Settings = () => {
    const dispatch = useDispatch()
    const languageChanged = useSelector((state) => state?.user?.languageChanged)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const user = useSelector((state) => state?.user?.userDetails)
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState(null)
    const [spin, setSpin] = useState(false)
    const [errMsg, setErrMsg] = useState(null)
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [settingsData, setSettingsData] = useState(null)
    const [edit, setEdit] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [imgPath, setImgPath] = useState('')
    const [toast, setToast] = useState(false)
    const [mode, setMode] = useState("market")
    const [sacks, setSacks] = useState(null)
    const [wages, setWages] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [removeId, setRemoveId] = useState(null)
    const [showAlertWage, setShowAlertWage] = useState(false)
    const [removeIdWage, setRemoveIdWage] = useState(null)
    const router = useRouter()

    const getSackList = async () => {
        const response = await getSackAPI()
        if (response?.status === 200) {
            setSacks(response?.data)
        }
        else {
            setErrMsg(response?.message)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }
    }

    const getWageList = async () => {
        const response = await getWageAPI()
        if (response?.status === 200) {
            setWages(response?.data)
        }
        else {
            setErrMsg(response?.message)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }
    }

    const onSubmit = async (data) => {
        if (isEditing) {
            setSpin(true)
            const formData = new FormData();
            formData.append("commission", data.commission);
            formData.append("magamai", data.magamai);
            formData.append("weekoff", data.weekoff);
            formData.append("financialYear", data.financialYear);
            formData.append("magamaiSource", data.magamaiSource);
            formData.append("language", data.language);
            formData.append("app_language", data.app_language);
            formData.append("magamaiType", data.magamaiType);
            formData.append("bill_type", data.bill_type);
            formData.append("magamai_show", data.magamai_show);

            if (data.file && data.file.length > 0) {
                formData.append("file", data.file[0]);
            } else if (settingsData.logo) {
                formData.append("existingLogo", settingsData.logo);
            }
            const response = await updateSettingsAPI(formData)
            if (response?.status === 200) {
                setSuccessMsg(response?.message)
                dispatch(changeLanguage(!languageChanged))
                dispatch(getBillMode(response.data))
                setSpin(false)
                setTimeout(() => {
                    reset()
                    getSettings()
                    setIsEditing(false)
                    setSuccessMsg(null)
                }, 2000)
            }
            else {
                setErrMsg(response?.message)
                setSpin(false)
                // setTimeout(() => {
                //     setErrMsg(null)
                // }, 2000)
            }
        }
        else {

            setSpin(true)
            const formData = new FormData();
            const payload = { ...data }
            for (const key in payload) {

                if (key === 'file' && payload[key].length > 0) {
                    formData.append(key, payload[key][0]);
                } else {
                    formData.append(key, payload[key]);
                }
            }
            const response = await addSettingsAPI(formData)
            if (response?.status === 200) {
                dispatch(changeLanguage(!languageChanged))
                setSuccessMsg(response?.message)
                dispatch(getBillMode(response.data))
                setSpin(false)
                setTimeout(() => {
                    reset()
                    getSettings()
                    setSuccessMsg(null)
                }, 2000)
            }
            else {
                setErrMsg(response?.message)
                setSpin(false)
                // setTimeout(() => {
                //     setErrMsg(null)
                // }, 2000)
            }

        }
    };

    const getSettings = async () => {
        setLoading(true)
        const response = await getMySettingsAPI()
        if (response?.status === 200) {
            setSettingsData(response?.data)
            const path = response?.data.logo.split('\\')
            const ImageURL = `http://localhost:3000/api/images/${path[path.length - 1]}`
            setImgPath(ImageURL)
            setEdit(false)
            setLoading(false)
            reset(response?.data)
        }
        else if (response?.status === 404) {
            setSettingsData(null)
            setEdit(true)
            setToast(true)
            setTimeout(() => {
                setToast(false)
            }, 3000)
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
    const showWarning = (id) => {
        setShowAlert(true)
        setRemoveId(id)
    }


    const closeWarning = () => {
        setShowAlert(false)
        setRemoveId(null)
    }
    const removeUserDetails = async () => {
        setLoading(true)
        setShowAlert(false)

        const response = await deleteSackAPI(removeId)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setTimeout(() => {
                setRemoveId(null)
                getSackList()
                setLoading(false)
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

    useEffect(() => {
        getSettings()
        getSackList()
        getWageList()
    }, [])

    const editSettings = (e) => {
        e.preventDefault()
        setEdit(true)
        setIsEditing(true);
        reset(settingsData)
    }

    const [showModal, setShowModal] = useState(false);
    const [sackEntries, setSackEntries] = useState([
        { sack_type: "", sack_price: "" }
    ]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setSackEntries([{ sack_type: "", sack_price: "" }]); // Reset on close
    };

    const handleAddEntry = () => {
        setSackEntries([...sackEntries, { sack_type: "", sack_price: "" }]);
    };

    const handleRemoveEntry = (index) => {
        const updatedEntries = sackEntries.filter((_, i) => i !== index);
        setSackEntries(updatedEntries);
    };

    const handleInputChange = (index, field, value) => {
        const updatedEntries = sackEntries.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry
        );
        setSackEntries(updatedEntries);
    };

    const handleSubmitSack = async () => {

        const validEntries = sackEntries.filter(
            (entry) => entry.sack_type.trim() !== "" && entry.sack_price.trim() !== ""
        );

        if (validEntries.length === 0 || validEntries[0].sack_type.trim() === "" || validEntries[0].sack_price.trim() === "") {
            alert("The first entry is required and cannot be empty.");
            return;
        }
        const payload = {
            sacks: validEntries
        }
        const response = await addSackAPI(payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            handleClose();
            getSackList()
            setTimeout(() => {
                setSuccessMsg(null)
            }, 2000)
        }
        else {
            setErrMsg(response.message)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }
    };

    const [editSack, setEditSack] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);

    const handleEditShow = (sack) => {
        setEditSack(sack);
        setEditModalShow(true);
    };

    const handleEditClose = () => {
        setEditSack(null);
        setEditModalShow(false);
    };

    const handleEditInputChange = (field, value) => {
        setEditSack((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitEdit = async () => {
        if (!editSack?.sack_type.trim() || !editSack?.sack_price) {
            alert("Sack type and price cannot be empty.");
            return;
        }

        const payload = {
            sack_id: editSack.sack_id,
            sack_type: editSack.sack_type,
            sack_price: editSack.sack_price,
        };

        const response = await editSackAPI(payload);
        if (response?.status === 200) {
            setSuccessMsg(response?.message);
            handleEditClose();
            getSackList();
            setTimeout(() => {
                setSuccessMsg(null);
            }, 2000);
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
        }
    };

    const showWarningWage = (id) => {
        setShowAlertWage(true)
        setRemoveIdWage(id)
    }


    const closeWarningWage = () => {
        setShowAlertWage(false)
        setRemoveIdWage(null)
    }
    const removeUserDetailsWage = async () => {
        setLoading(true)
        setShowAlertWage(false)

        const response = await deleteWageAPI(removeIdWage)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setTimeout(() => {
                setRemoveIdWage(null)
                getWageList()
                setLoading(false)
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


    const [showModalWage, setShowModalWage] = useState(false);
    const [wageEntries, setWageEntries] = useState([
        { from_kg: "", to_kg: "", wage: "" }
    ]);

    const handleShowWage = () => setShowModalWage(true);
    const handleCloseWage = () => {
        setShowModalWage(false);
        setWageEntries([{ from_kg: "", to_kg: "", wage: "" }]); // Reset on close
    };

    const handleAddWageEntry = () => {
        setWageEntries([...wageEntries, { from_kg: "", to_kg: "", wage: "" }]);
    };

    const handleRemoveWageEntry = (index) => {
        const updatedEntries = wageEntries.filter((_, i) => i !== index);
        setWageEntries(updatedEntries);
    };

    const handleWageInputChange = (index, field, value) => {
        const updatedEntries = wageEntries.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry
        );
        setWageEntries(updatedEntries);
    };

    const handleSubmitWage = async () => {
        const validEntries = wageEntries.filter(
            (entry) => entry.from_kg.trim() !== "" && entry.to_kg.trim() !== "" && entry.wage.trim() !== ""
        );

        if (validEntries.length === 0 || validEntries[0].from_kg.trim() === "" || validEntries[0].to_kg.trim() === "" || validEntries[0].wage.trim() === "") {
            alert("The first entry is required and cannot be empty.");
            return;
        }
        const payload = {
            wages: validEntries
        };
        const response = await addWageAPI(payload);
        if (response?.status === 200) {
            setSuccessMsg(response?.message);
            handleCloseWage();
            getWageList();
            setTimeout(() => {
                setSuccessMsg(null);
            }, 2000);
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
        }
    };

    const [editWage, setEditWage] = useState(null);
    const [editModalShowWage, setEditModalShowWage] = useState(false);

    const handleEditShowWage = (wage) => {
        setEditWage(wage);
        setEditModalShowWage(true);
    };

    const handleEditCloseWage = () => {
        setEditWage(null);
        setEditModalShowWage(false);
    };

    const handleEditWageInputChange = (field, value) => {
        setEditWage((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitEditWage = async () => {
        if ((!editWage?.from_kg && editWage?.from_kg !== 0) || !editWage?.to_kg || (!editWage?.wage && editWage?.wage !== 0)) {
            alert("From, To, and Wage cannot be empty.");
            return;
        }

        const payload = {
            wage_id: editWage.wage_id,
            from_kg: editWage.from_kg,
            to_kg: editWage.to_kg,
            wage: editWage.wage,
        };

        const response = await editWageAPI(payload);
        if (response?.status === 200) {
            setSuccessMsg(response?.message);
            handleEditCloseWage();
            getWageList();
            setTimeout(() => {
                setSuccessMsg(null);
            }, 2000);
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
        }
    };

    const handleCloseError = () => {
        setErrMsg(null)
    }


    return (
        <div className='app-container'>
            {user?.user_role === "marketer" ? (
                <>
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                <h2 className='primary-color text-center flex-grow-1 m-0'>
                                    {translations[app_language]?.settings}
                                </h2>
                            </div>

                            <ul className="nav nav-pills mb-3  pt-3" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className={`nav-link ${mode === "market" ? "active" : ""}`} id="pills-home-tab" onClick={() => setMode("market")}>{translations[app_language]?.market}</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className={`nav-link ${mode === "sack" ? "active" : ""}`} id="pills-profile-tab" onClick={() => setMode("sack")}>{translations[app_language]?.sack}</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className={`nav-link ${mode === "wage" ? "active" : ""}`} id="pills-wage-tab" onClick={() => setMode("wage")}>{translations[app_language]?.coolie}</button>
                                </li>
                            </ul>
                            {mode === "market" &&

                                <div className="container mt-4">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="row">
                                            {sub_status ? <div className="col-12 text-end mb-2">
                                                {(!settingsData || edit) && (
                                                    <button type="submit" className="submit-btn py-2 px-2">
                                                        {spin ? <Spinner /> : translations[app_language]?.saveSettings}
                                                    </button>
                                                )}
                                                {(settingsData && !edit) && (
                                                    <button
                                                        type="button"
                                                        className="submit-btn py-2 px-2"
                                                        onClick={editSettings}
                                                    >
                                                        {spin ? <Spinner /> : translations[app_language]?.editSettings}
                                                    </button>
                                                )}
                                            </div> : ""}
                                        </div>
                                        <div className='border border-muted p-3 mb-4'>
                                            <h4 className='mb-2 input-heading'>{translations[app_language]?.market}</h4>
                                            <div className="row my-2">

                                                <div className="col-md-3">
                                                    <label htmlFor="marketHoliday">{translations[app_language]?.marketHoliday}</label>
                                                    <select
                                                        id="marketHoliday"
                                                        className="form-select"
                                                        {...register('weekoff', {
                                                            required: 'Market Holiday is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                                                            <option key={day} value={day}>
                                                                {translations[app_language][day]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.weekoff && <p className="text-danger">{errors.weekoff.message}</p>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="financialYear">{translations[app_language]?.financialYear}</label>
                                                    <select
                                                        id="financialYear"
                                                        className="form-select"
                                                        {...register('financialYear', {
                                                            required: 'Financial year is required',
                                                            valueAsNumber: true,
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value={1}>{translations[app_language]?.jandec}</option>
                                                        <option value={4}>{translations[app_language]?.aprmar}</option>
                                                    </select>
                                                    {errors.financialYear && <p className="text-danger">{errors.financialYear.message}</p>}
                                                </div>

                                                <div className="col-md-3">
                                                    <label htmlFor="billType">{translations[app_language]?.billMode}</label>
                                                    <select
                                                        id="billType"
                                                        className="form-select"
                                                        {...register('bill_type', {
                                                            required: 'Bill Mode is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        {['auto', 'manual'].map((type) => (
                                                            <option key={type} value={type}>
                                                                {translations[app_language][type]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.weekoff && <p className="text-danger">{errors.weekoff.message}</p>}
                                                </div>


                                                <div className="col-md-3">
                                                    <label>{translations[app_language]?.shopLogo}</label>
                                                    {settingsData?.logo && !edit && (
                                                        <img src={imgPath} alt="logo" className="img-fluid" width={100} height={50} />
                                                    )}
                                                    {(!settingsData || isEditing) && (
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            {...register("file", {
                                                                required: !isEditing,
                                                            })}
                                                            disabled={!edit}
                                                        />
                                                    )}
                                                    {errors.file && <p className="text-danger">Logo is required</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='border border-muted p-3 mb-4'>
                                            <h4 className='mb-2 input-heading'>{translations[app_language]?.deductions}</h4>
                                            <div className="row my-2">
                                                <div className="col-md-3">
                                                    <label htmlFor="commission">{translations[app_language]?.commission}(%)</label>
                                                    <input
                                                        id="commission"
                                                        type="number"
                                                        className="form-control"
                                                        onWheel={(e) => e.target.blur()}
                                                        {...register('commission', {
                                                            required: 'Commission is required',
                                                            pattern: {
                                                                value: /^\d*\.?\d*$/,
                                                                message: 'Commission rate must be a valid number',
                                                            },
                                                            min: {
                                                                value: 0,
                                                                message: 'Commission rate must be at least 0',
                                                            },
                                                            max: {
                                                                value: 100,
                                                                message: 'Commission rate must not exceed 100',
                                                            },
                                                        })}
                                                        disabled={!edit}
                                                    />
                                                    {errors.commission && <p className="text-danger">{errors.commission.message}</p>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="magamaiSource">{translations[app_language]?.magamaiSource}</label>
                                                    <select
                                                        id="magamaiSource"
                                                        className="form-select"
                                                        {...register('magamaiSource', {
                                                            required: 'Magamai Source is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value="farmer">{translations[app_language]?.farmer}</option>
                                                        <option value="commission">{translations[app_language]?.commission}</option>
                                                    </select>
                                                    {errors.magamaiSource && <p className="text-danger">{errors.magamaiSource.message}</p>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="magamaiType">{translations[app_language]?.magamaiType}</label>
                                                    <select
                                                        id="magamaiType"
                                                        className="form-select"
                                                        {...register('magamaiType', {
                                                            required: 'Magamai Type is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value="percentage">{translations[app_language]?.percentage}</option>
                                                        <option value="sack">{translations[app_language]?.sackCount}</option>
                                                    </select>
                                                    {errors.magamaiType && <p className="text-danger">{errors.magamaiType.message}</p>}
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="magamai">{translations[app_language]?.magamai}(%)</label>
                                                    <input
                                                        id="magamai"
                                                        type="number"
                                                        className="form-control"
                                                        onWheel={(e) => e.target.blur()}
                                                        {...register('magamai', {
                                                            required: 'Magamai is required',
                                                            pattern: {
                                                                value: /^\d*\.?\d*$/,
                                                                message: 'Magamai must be a valid number',
                                                            },
                                                            min: {
                                                                value: 0,
                                                                message: 'Magamai must be at least 0',
                                                            },
                                                            max: {
                                                                value: 100,
                                                                message: 'Magamai must not exceed 100',
                                                            },
                                                        })}
                                                        disabled={!edit}
                                                    />
                                                    {errors.magamai && <p className="text-danger">{errors.magamai.message}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='border border-muted p-3'>
                                            <h4 className='mb-2 input-heading'>{translations[app_language]?.language}</h4>
                                            <div className="row my-2">
                                                <div className="col-md-4">
                                                    <label htmlFor="app_language">{translations[app_language]?.appLanguage}</label>
                                                    <select
                                                        id="app_language"
                                                        className="form-select"
                                                        {...register('app_language', {
                                                            required: 'App Language is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value="english">English</option>
                                                        <option value="tamil">தமிழ்</option>
                                                    </select>
                                                    {errors.app_language && <p className="text-danger">{errors.app_language.message}</p>}
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="language">{translations[app_language]?.billLanguage}</label>
                                                    <select
                                                        id="language"
                                                        className="form-select"
                                                        {...register('language', {
                                                            required: 'Language is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value="english">English</option>
                                                        <option value="tamil">தமிழ்</option>
                                                    </select>
                                                    {errors.language && <p className="text-danger">{errors.language.message}</p>}
                                                </div>
                                                <div className="col-md-4">
                                                    <label htmlFor="magamai-show">{translations[app_language]?.magamai_show}</label>
                                                    <select
                                                        id="magamai-show"
                                                        className="form-select"
                                                        {...register('magamai_show', {
                                                            required: 'Magamai Show is required',
                                                        })}
                                                        disabled={!edit}
                                                    >
                                                        <option value={0}>No</option>
                                                        <option value={1}>Yes</option>
                                                    </select>
                                                    {errors.magamai_show && <p className="text-danger">{errors.magamai_show.message}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                            }

                            {mode === "sack" &&
                                <div className="settings-container">
                                    <>
                                        <div className='d-flex justify-content-end'>
                                            {sub_status ? <button className='submit-btn py-2 px-2' onClick={handleShow}>{translations[app_language]?.addSack}</button> : ""}
                                        </div>
                                        {sacks?.length > 0
                                            ?
                                            <>
                                                <h4 className="text-center my-3">{translations[app_language]?.sackDetails}</h4>
                                                <table className="table  table-hover border border-dark sack-table bg-white wage-table">
                                                    <thead className="thead-light">
                                                        <tr className="text-center">
                                                            <th>{translations[app_language]?.sackType}</th>
                                                            <th>{translations[app_language]?.price}</th>
                                                            <th>{translations[app_language]?.actions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sacks.map((v, i) => (
                                                            <tr key={i} className="text-center align-middle">
                                                                <td>{v.sack_type}</td>
                                                                <td>₹{v.sack_price}</td>

                                                                <td>
                                                                    {(v.sack_type !== "sack0/Box") &&
                                                                        <>
                                                                            <button className="btn btn-sm btn-success me-2" onClick={() => handleEditShow(v)}><CiEdit /></button>
                                                                            <button className="btn btn-sm btn-danger" onClick={() => showWarning(v.sack_id)}><MdDeleteOutline /></button>
                                                                        </>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                            :
                                            <p className='text-danger fw-bold fs-5 text-center mt-5'>{translations[app_language]?.noRecords}</p>
                                        }

                                        <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmitSack();
                                            }}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>{translations[app_language]?.addSack}</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {sackEntries.map((entry, index) => (
                                                        <div key={index} className="mb-3 d-flex align-items-center">
                                                            <input
                                                                type="text"
                                                                className="form-control me-2"
                                                                placeholder={translations[app_language]?.sackType}
                                                                value={entry.sack_type}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, "sack_type", e.target.value)
                                                                }
                                                            />
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                className="form-control me-2"
                                                                placeholder={translations[app_language]?.price}
                                                                value={entry.sack_price}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, "sack_price", e.target.value)
                                                                }
                                                            />
                                                            {sackEntries.length > 1 && (
                                                                <button type='button'
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleRemoveEntry(index)}
                                                                >
                                                                    -
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type='button'
                                                        className="btn primary-bg-color text-white   btn-sm"
                                                        onClick={handleAddEntry}
                                                    >
                                                        + Add Another
                                                    </button>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleClose} type='button'>
                                                        {translations[app_language]?.cancel}
                                                    </Button>
                                                    <Button variant="" className='primary-bg-color border-0 text-white sack_btn' type="submit" >
                                                        {translations[app_language]?.submit}
                                                    </Button>
                                                </Modal.Footer>
                                            </form>
                                        </Modal>

                                        <Modal show={editModalShow} onHide={handleEditClose} backdrop="static" keyboard={true}>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmitEdit();
                                            }}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>{translations[app_language]?.editSack}</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {editSack && (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div>
                                                                <label>Sack Type</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control me-2"
                                                                    placeholder={translations[app_language]?.sackType}
                                                                    value={editSack.sack_type}
                                                                    onChange={(e) => handleEditInputChange("sack_type", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label>Sack Price</label>
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    className="form-control me-2"
                                                                    placeholder={translations[app_language]?.price}
                                                                    value={editSack.sack_price}
                                                                    onChange={(e) => handleEditInputChange("sack_price", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                    )}
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleEditClose} type='button'>
                                                        {translations[app_language]?.cancel}
                                                    </Button>
                                                    <Button variant="" className="primary-bg-color text-white sack_btn" type="submit">
                                                        {translations[app_language]?.submit}
                                                    </Button>
                                                </Modal.Footer>
                                            </form>
                                        </Modal>
                                    </>
                                </div>
                            }

                            {mode === "wage" &&
                                <div className="settings-container">
                                    <>
                                        <div className='d-flex justify-content-end'>
                                            {sub_status ? <button className='submit-btn py-2 px-2' onClick={handleShowWage}>{translations[app_language]?.addWage}</button> : ""}
                                        </div>
                                        {wages?.length > 0
                                            ?
                                            <>
                                                <h4 className="text-center my-3">{translations[app_language]?.wageDetails}</h4>
                                                <table className="table table-hover border border-dark wage-table bg-white">
                                                    <thead className="thead-light">
                                                        <tr className="text-center">
                                                            <th>{translations[app_language]?.fromkg}</th>
                                                            <th>{translations[app_language]?.tokg}</th>
                                                            <th>{translations[app_language]?.coolie}</th>
                                                            <th>{translations[app_language]?.actions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {wages.map((v, i) => (
                                                            <tr key={i} className="text-center align-middle">
                                                                <td>{v.from_kg}</td>
                                                                <td>{v.to_kg}</td>
                                                                <td>₹{v.wage}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-success me-2" onClick={() => handleEditShowWage(v)}><CiEdit /></button>
                                                                    <button className="btn btn-sm btn-danger" onClick={() => showWarningWage(v.wage_id)}><MdDeleteOutline /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                            :
                                            <p className='text-danger fw-bold fs-5 text-center mt-5'>{translations[app_language]?.noRecords}</p>
                                        }

                                        <Modal show={showModalWage} onHide={handleCloseWage} backdrop="static" keyboard={false}>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmitWage();
                                            }}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>{translations[app_language]?.addWage}</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {wageEntries.map((entry, index) => (
                                                        <div key={index} className="mb-3 d-flex align-items-center">
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                className="form-control me-2"
                                                                placeholder={translations[app_language]?.fromkg}
                                                                value={entry.from_kg}
                                                                onChange={(e) =>
                                                                    handleWageInputChange(index, "from_kg", e.target.value)
                                                                }
                                                            />
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                className="form-control me-2"
                                                                placeholder={translations[app_language]?.tokg}
                                                                value={entry.to_kg}
                                                                onChange={(e) =>
                                                                    handleWageInputChange(index, "to_kg", e.target.value)
                                                                }
                                                            />
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                className="form-control me-2"
                                                                placeholder={translations[app_language]?.coolie}
                                                                value={entry.wage}
                                                                onChange={(e) =>
                                                                    handleWageInputChange(index, "wage", e.target.value)
                                                                }
                                                            />
                                                            {wageEntries.length > 1 && (
                                                                <button type='button'
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleRemoveWageEntry(index)}
                                                                >
                                                                    -
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type='button'
                                                        className="btn primary-bg-color text-white btn-sm"
                                                        onClick={handleAddWageEntry}
                                                    >
                                                        + Add Another
                                                    </button>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleCloseWage} type='button'>
                                                        {translations[app_language]?.cancel}
                                                    </Button>
                                                    <Button variant="" className='primary-bg-color border-0 text-white wage_btn' type="submit">
                                                        {translations[app_language]?.submit}
                                                    </Button>
                                                </Modal.Footer>
                                            </form>
                                        </Modal>

                                        <Modal show={editModalShowWage} onHide={handleEditCloseWage} backdrop="static" keyboard={true}>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSubmitEditWage();
                                            }}>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>{translations[app_language]?.editWage}</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {editWage && (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div>
                                                                <label>{translations[app_language]?.fromkg}</label>
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    className="form-control me-2"
                                                                    placeholder={translations[app_language]?.fromkg}
                                                                    value={editWage.from_kg}
                                                                    onChange={(e) => handleEditWageInputChange("from_kg", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label>{translations[app_language]?.tokg}</label>
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    className="form-control me-2"
                                                                    placeholder={translations[app_language]?.tokg}
                                                                    value={editWage.to_kg}
                                                                    onChange={(e) => handleEditWageInputChange("to_kg", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label>{translations[app_language]?.coolie}</label>
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    className="form-control me-2"
                                                                    placeholder={translations[app_language]?.coolie}
                                                                    value={editWage.wage}
                                                                    onChange={(e) => handleEditWageInputChange("wage", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleEditCloseWage} type='button'>
                                                        {translations[app_language]?.cancel}
                                                    </Button>
                                                    <Button variant="" className="primary-bg-color text-white wage_btn" type="submit">
                                                        {translations[app_language]?.submit}
                                                    </Button>
                                                </Modal.Footer>
                                            </form>
                                        </Modal>
                                    </>
                                </div>
                            }



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
                                                    <h4 className="modal-title w-100">Are you sure?</h4>
                                                </div>
                                            </div>
                                            <div className="modal-body">
                                                <p className='text-center'>Do you really want to continue? This process will delete the sack permanently.</p>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" onClick={closeWarning}>Close</button>

                                                <button type="button" className="btn btn-secondary" onClick={removeUserDetails}>Confirm</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`modal ${showAlertWage ? "show" : ""} col-5`}>
                                <div className="modal-dialog">
                                    <div className="modal-dialog modal-confirm">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <div className="icon-box" onClick={closeWarningWage}>
                                                    <IoCloseCircleOutline className='close pointer' size={28} />
                                                </div>
                                                <div className="col-12 text-center">
                                                    <FiAlertTriangle size={40} className='text-danger' />
                                                </div>
                                                <div className="col-12">
                                                    <h4 className="modal-title w-100">Are you sure?</h4>
                                                </div>
                                            </div>
                                            <div className="modal-body">
                                                <p className='text-center'>Do you really want to continue? This process will delete the wage permanently.</p>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" onClick={closeWarningWage}>Close</button>

                                                <button type="button" className="btn btn-secondary" onClick={removeUserDetailsWage}>Confirm</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                    }
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
            ) : (
                <>
                    {user ? <AccessDenied /> : <Loader />}
                </>
            )}
        </div >
    );
}

export default Settings;
