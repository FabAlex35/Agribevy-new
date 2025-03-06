"use client"
import AccessDenied from '@/src/Components/AccessDenied'
import Loader from '@/src/Components/Loader'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { useRouter } from 'next/navigation'
import Spinner from '@/src/Components/Spinner'
import { addExpensesAPI, getAllExpensesAPI, getSingleExpenseAPI, updateExpensesAPI } from '@/src/Components/Api'
import { FaEye, FaEdit } from 'react-icons/fa';
import ModalBoxError from '@/src/Components/ModalBoxError'
const Expenses = () => {

    const [expensesData, setExpensesData] = useState(null);
    const user = useSelector((state) => state?.user?.userDetails)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const router = useRouter()
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isVisible, setIsVisible] = useState(false);
    const [spinAdd, setSpinAdd] = useState(false)
    const [filterDate, setFilterDate] = useState(null)
    const [filterDateStart, setFilterDateStart] = useState(null)
    const [filtering, setFiltering] = useState(false)
    const [initial, setInitial] = useState(null)
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [isVisibleEdit, setIsVisibleEdit] = useState(false)
    const [editData, setEditData] = useState(null)
    const [id, setId] = useState(null)

    const toggleTooltip = (index) => {
        setActiveTooltip(activeTooltip === index ? null : index);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const expenseFields = [
        { name: 'rent', label: translations[app_language]?.rent },
        { name: 'wage', label: translations[app_language]?.employeeWage },
        { name: 'expenditure', label: translations[app_language]?.teaSnacks },
        { name: 'fuel', label: translations[app_language]?.fuel },
        { name: 'electricity', label: translations[app_language]?.electricity },
        { name: 'water', label: translations[app_language]?.water },
        { name: 'mobile', label: translations[app_language]?.mobile },
        { name: 'travel', label: translations[app_language]?.travel },
        { name: 'miscellneous', label: translations[app_language]?.misc }
    ];

    const expenseFieldsEdit = [
        { name: 'rent', label: translations[app_language]?.rent },
        { name: 'wage', label: translations[app_language]?.employeeWage },
        { name: 'expenditure', label: translations[app_language]?.teaSnacks },
        { name: 'fuel', label: translations[app_language]?.fuel },
        { name: 'electricity', label: translations[app_language]?.electricity },
        { name: 'water', label: translations[app_language]?.water },
        { name: 'mobile', label: translations[app_language]?.mobile },
        { name: 'travel', label: translations[app_language]?.travel },
        { name: 'miscellaneous', label: translations[app_language]?.misc }
    ];

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        rent: '',
        wage: '',
        expenditure: '',
        fuel: '',
        electricity: '',
        water: '',
        mobile: '',
        travel: '',
        miscellneous: ''
    });

    const [formDataEdit, setFormDataEdit] = useState({
        date: '',
        rent: 0,
        wage: 0,
        expenditure: 0,
        fuel: 0,
        electricity: 0,
        water: 0,
        mobile: 0,
        travel: 0,
        miscellaneous: 0,
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSpinAdd(true)

        const updatedFormData = {};

        for (const key in formData) {
            if (key === "date") {

                updatedFormData[key] = formData[key];
            } else {
                updatedFormData[key] = formData[key] === "" ? 0 : Number(formData[key]);
            }
        }
        setFormData(updatedFormData);
        const response = await addExpensesAPI(updatedFormData)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setFilterDate("")
                setFilterDateStart("")
                setFiltering(false)
                getAllExpenses()
                setIsVisible(false);
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    rent: '',
                    wage: '',
                    expenditure: '',
                    fuel: '',
                    electricity: '',
                    water: '',
                    mobile: '',
                    travel: '',
                    miscellneous: ''
                })
            }, 2000)

        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }


    };

    const closeExpenseForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            rent: '',
            wage: '',
            expenditure: '',
            fuel: '',
            electricity: '',
            water: '',
            mobile: '',
            travel: '',
            miscellneous: ''
        })
        setIsVisible(false)
    }

    const editExpenses = (expense) => {
        setId(expense?.id)
        setEditData(expense)
        setIsVisibleEdit(true)
    }

    const handleInputChangeEdit = (e) => {
        const { name, value } = e.target;
        setFormDataEdit(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setSpinAdd(true)

        const updatedFormData = {};

        for (const key in formDataEdit) {
            if (key === "date") {

                updatedFormData[key] = formDataEdit[key];
            } else {

                updatedFormData[key] = formDataEdit[key] === "" ? 0 : Number(formDataEdit[key]);
            }
        }
        setFormDataEdit(updatedFormData);
        const response = await updateExpensesAPI(id, updatedFormData)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                if (filtering) {
                    filterData()
                }

                else {
                    getAllExpenses()
                }

                setIsVisibleEdit(false);
                setFormDataEdit({
                    date: new Date().toISOString().split('T')[0],
                    rent: '',
                    wage: '',
                    expenditure: '',
                    fuel: '',
                    electricity: '',
                    water: '',
                    mobile: '',
                    travel: '',
                    miscellneous: ''
                })
            }, 2000)

        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }


    };

    const closeExpenseFormEdit = () => {
        setFormDataEdit({
            date: new Date().toISOString().split('T')[0],
            rent: '',
            wage: '',
            expenditure: '',
            fuel: '',
            electricity: '',
            water: '',
            mobile: '',
            travel: '',
            miscellaneous: ''
        })
        setIsVisibleEdit(false)
        setId(null)
    }

    const getAllExpenses = async () => {

        setLoading(true)
        const response = await getAllExpensesAPI()
        if (response?.status === 200) {
            setExpensesData(response?.data)
            setFiltering(false)
            setFilterDate("")
            setFilterDateStart("")
            setInitial(response?.data)
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

    const showAll = () => {
        getAllExpenses()
    }


    const filterData = async () => {
        setFiltering(true)
        setLoading(true)

        const response = await getSingleExpenseAPI(filterDateStart, filterDate)
        if (response?.status === 200) {
            setExpensesData(response?.data)
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

    useEffect(() => {
        getAllExpenses()
    }, [])

    useEffect(() => {
        if (editData) {
            setFormDataEdit({
                date: editData.date,
                rent: editData.details.find(item => item.category === 'Rent').amount,
                wage: editData.details.find(item => item.category === 'Wage').amount,
                expenditure: editData.details.find(item => item.category === 'Snacks').amount,
                fuel: editData.details.find(item => item.category === 'Fuel').amount,
                electricity: editData.details.find(item => item.category === 'Electricity').amount,
                water: editData.details.find(item => item.category === 'Water').amount,
                mobile: editData.details.find(item => item.category === 'Mobile').amount,
                travel: editData.details.find(item => item.category === 'Travel').amount,
                miscellaneous: editData.details.find(item => item.category === 'Miscellaneous').amount,
            });
        }
    }, [editData, isVisibleEdit]);

    const handleCloseError = () => {
        setErrMsg(null)
    }
    return (
        <div className='app-container'>
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts)) ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {translations[app_language]?.expenses}
                                    </h2>
                                </div>

                                <div className='d-flex justify-content-end mt-4'>
                                    {sub_status ? <button className='submit-btn py-2 px-2' onClick={() => setIsVisible(true)}>{translations[app_language]?.addExpenses}</button> :""}
                                </div>

                                <div className='d-flex justify-content-between mt-2 align-items-center'>
                                    <div className='d-flex justify-content-start gap-3 align-items-center'>
                                        <input type='date' className='date-inp ' onChange={(e) => setFilterDateStart(e.target.value)} value={filterDateStart} max={new Date().toISOString().split('T')[0]} />
                                        <div className='primary-color fw-bold'>To</div>
                                        <input type='date' className='date-inp ' onChange={(e) => setFilterDate(e.target.value)} value={filterDate} max={new Date().toISOString().split('T')[0]} />
                                        <button className='submit-btn requirement-btn py-2' onClick={filterData} disabled={!(filterDate && filterDateStart)}>{translations[app_language]?.filter}</button>
                                    </div>
                                    {filtering &&
                                        <button className='submit-btn py-2' onClick={showAll}>{translations[app_language]?.resetFilter}</button>}
                                </div>

                                <div className="container py-4">
                                    {expensesData?.length > 0 ?
                                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                                            {expensesData
                                                ?.sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map((dateExpense, dateIndex) => (
                                                    <div key={dateIndex} className="col">
                                                        <div className="expense-card">
                                                            <div className="card-header-custom">
                                                                <h3 className="date-text">{formatDate(dateExpense.date)}</h3>
                                                                <div className='d-flex align-items-center'>
                                                                    <button
                                                                        className="icon-button"
                                                                        onClick={() => toggleTooltip(dateIndex)}
                                                                    >
                                                                        <FaEye size={20} className='primary-color' />
                                                                    </button>
                                                                    &nbsp;/ &nbsp;
                                                                    <button className="icon-button" onClick={() => editExpenses(dateExpense)}>
                                                                        <FaEdit size={20} className='primary-color' />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="amount-text">₹{dateExpense.totalAmount}</div>

                                                        </div>

                                                        {activeTooltip === dateIndex && (
                                                            <>
                                                                <div className="modal show d-block expense-tooltip" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                                                                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                                                                        <div className="modal-content">
                                                                            <div className="modal-header">
                                                                                <h5 className="modal-title">{translations[app_language]?.expenseDetails} -{formatDate(dateExpense.date)}</h5>
                                                                                <button type="button" className="btn-close" onClick={() => toggleTooltip(dateIndex)}></button>
                                                                            </div>
                                                                            <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                                                                                <div className="">
                                                                                    {dateExpense.details.map((expense, expenseIndex) => (
                                                                                        <div key={expenseIndex} className="expense-item">
                                                                                            <span>{app_language === "tamil" ? expense.tamil : expense.category}</span>
                                                                                            <div className="expense-action">
                                                                                                <span className="amount">₹{expense.amount}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="tooltip-footer">
                                                                                    <div className="total-row">
                                                                                        <span>{translations[app_language]?.total}</span>
                                                                                        <span>₹{dateExpense.totalAmount}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </>
                                                        )}
                                                    </div>

                                                ))}
                                        </div>
                                        :
                                        <div className='text-center fs-2 fw-bold text-danger mt-5'>{translations[app_language]?.noExpenses}</div>
                                    }
                                </div>

                                {isVisible && (
                                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                                        <div className="modal-dialog modal-lg modal-dialog-scrollable">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title">{translations[app_language]?.expenseEntry}</h5>
                                                    <button type="button" className="btn-close" onClick={closeExpenseForm}></button>
                                                </div>
                                                <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                                                    <form>
                                                        <div className="mb-3">
                                                            <label className="form-label">{translations[app_language]?.emptyDate} <sup className="super">*</sup></label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="date"
                                                                value={formData.date}
                                                                onChange={handleInputChange}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="row">
                                                            {expenseFields.map((field) => (
                                                                <div key={field.name} className="col-md-6 mb-3">
                                                                    <label className="form-label">{field.label}</label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        name={field.name}
                                                                        value={formData[field.name]}
                                                                        onChange={handleInputChange}
                                                                        placeholder={translations[app_language]?.enterAmount}
                                                                        onWheel={(e) => e.target.blur()}

                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="modal-footer">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={closeExpenseForm}
                                                    >
                                                        {translations[app_language]?.cancel}
                                                    </button>
                                                    <button type="submit" className=" expense-button-primary" onClick={handleSubmit} disabled={!formData.date}>
                                                        {spinAdd ? <Spinner /> : translations[app_language]?.submit}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isVisibleEdit && (
                                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                                        <div className="modal-dialog modal-lg modal-dialog-scrollable">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title">{translations[app_language]?.expenseEdit} </h5>
                                                    <button type="button" className="btn-close" onClick={closeExpenseFormEdit}></button>
                                                </div>
                                                <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                                                    <form>
                                                        <div className="mb-3">
                                                            <label className="form-label">{translations[app_language]?.emptyDate}<sup className="super">*</sup></label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="date"
                                                                value={formDataEdit.date}
                                                                onChange={handleInputChangeEdit}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="row">
                                                            {expenseFieldsEdit.map((field) => (
                                                                <div key={field.name} className="col-md-6 mb-3">
                                                                    <label className="form-label">{field.label}</label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        name={field.name}
                                                                        value={formDataEdit[field.name]}
                                                                        onChange={handleInputChangeEdit}
                                                                        placeholder={translations[app_language]?.enterAmount}
                                                                        onWheel={(e) => e.target.blur()}

                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="modal-footer">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={closeExpenseFormEdit}
                                                    >
                                                        {translations[app_language]?.cancel}
                                                    </button>
                                                    <button type="submit" className=" expense-button-primary" onClick={handleSubmitEdit} disabled={!formData.date}>
                                                        {spinAdd ? <Spinner /> : translations[app_language]?.submit}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* toast  */}
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

export default Expenses