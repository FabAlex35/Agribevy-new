"use client"
import AccessDenied from '@/src/Components/AccessDenied';
import { getMyTransactionsAPI } from '@/src/Components/Api';
import Invoice from '@/src/Components/Invoice';
import InvoiceBuyer from '@/src/Components/InvoiceBuyer';
import Loader from '@/src/Components/Loader';
import React, { useEffect, useState } from 'react'
import { FaFilePdf } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import { IoClose } from 'react-icons/io5'
import { RxCrossCircled } from "react-icons/rx";
const Transactions = () => {
    const user = useSelector((state) => state?.user?.userDetails)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenBuyer, setIsModalOpenBuyer] = useState(false);
    const [mode, setMode] = useState("farmer")
    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState(null);
    const [searchQueryBuyer, setSearchQueryBuyer] = useState("");
    const [tableDataBuyer, setTableDataBuyer] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isClosingBuyer, setIsClosingBuyer] = useState(false);
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [invoiceData,setInvoiceData]=useState(null)
    const [invoiceDataBuyer,setInvoiceDataBuyer]=useState(null)


    const openModal = (obj) => {
        setIsModalOpen(true);
        setIsClosing(false);
        setInvoiceData(obj)
    };


    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => setIsModalOpen(false), 300);
    };
    const openModalBuyer = (obj) => {
        setIsModalOpenBuyer(true);
        setIsClosingBuyer(false);
        setInvoiceDataBuyer(obj)
    };


    const closeModalBuyer = () => {
        setIsClosingBuyer(true);
        setTimeout(() => setIsModalOpenBuyer(false), 300);
    };
    const filteredData = tableData?.filter((item) =>
        item.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.veg_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDataBuyer = tableDataBuyer?.filter((item) =>
        item.buyer_name?.toLowerCase().includes(searchQueryBuyer.toLowerCase()) ||
        item.veg_name?.toLowerCase().includes(searchQueryBuyer.toLowerCase())
    );

    const swicthFarmer = () => {
        setMode("farmer")
        setIsModalOpenBuyer(false);
        setIsClosingBuyer(true);
    }

    const swicthBuyer = () => {
        setMode("buyer")
        setIsClosing(true);
        setIsModalOpen(false)
    }


    const getAllTransactions = async () => {
        setLoading(true)
        const response = await getMyTransactionsAPI()
        if (response?.status === 200) {
            setTableData(response?.data)
            setTableDataBuyer(response?.data)
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
        getAllTransactions()
    }, [])
    return (
        <div className='app-container'>
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts)) ?
                <>
                    {
                        loading ?
                            <Loader /> :
                            <>
                                <div className='head pt-2 text-center '>
                                    <h2 className='primary-color '>My transactions</h2>
                                </div>
                                <ul className="nav nav-pills mb-3 mt-3" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${mode === "farmer" ? "active" : ""}`} id="pills-home-tab" onClick={swicthFarmer}>Farmer transactions</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${mode === "buyer" ? "active" : ""}`} id="pills-profile-tab" onClick={swicthBuyer}>Buyer transactions</button>
                                    </li>
                                </ul>

                                {mode === "farmer" &&
                                    <div>
                                        <div className='d-flex justify-content-end mt-3' >

                                            <input
                                                type="text"
                                                className=' search-input'
                                                placeholder='Search'
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        <div className="table-container">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Farmer</th>
                                                        <th>Vegetable</th>
                                                        <th>Quantity</th>
                                                        <th>Amount</th>
                                                        <th>Traded date</th>
                                                        <th>Invoice</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredData?.length > 0 ? (
                                                        filteredData?.sort((a, b) => new Date(b?.soldDate) - new Date(a?.soldDate))?.map((v, i) => (
                                                            <tr key={i} className={v?.farmer_status==="paid"?"paid":"unpaid"}>
                                                                <td>{v?.farmer_name}</td>
                                                                <td>{v?.veg_name}</td>
                                                                <td>{v?.sold}</td>
                                                                <td>{v?.amount}</td>
                                                                <td>{new Date(v?.soldDate).toLocaleDateString('en-IN')}</td>
                                                                <td><FaFilePdf size={22} onClick={()=>openModal(v)} className='border-0 pointer'/></td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">No results found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {isModalOpen && (
                                            <div className={`modal d-block modal-fullscreen ${isClosing ? 'fade-out' : 'fade-in'}`} tabIndex="-1">
                                                <div className="modal-dialog modal-fullscreen">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title text-center">Invoice</h5>
                                                            <button type="button" className="btn-close" onClick={closeModal}></button>
                                                        </div>
                                                        <div className="modal-body" >
                                                        <Invoice data={invoiceData} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>}

                                {mode === "buyer" &&
                                    <div>
                                        <div className='d-flex justify-content-end mt-3' >

                                            <input
                                                type="text"
                                                className=' search-input'
                                                placeholder='Search'
                                                value={searchQueryBuyer}
                                                onChange={(e) => setSearchQueryBuyer(e.target.value)}
                                            />
                                        </div>
                                        <div className="table-container">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Buyer</th>
                                                        <th>Vegetable</th>
                                                        <th>Quantity</th>
                                                        <th>Amount</th>
                                                        <th>Traded date</th>
                                                        <th>Invoice</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {filteredDataBuyer?.length > 0 ? (
                                                        filteredDataBuyer?.sort((a, b) => new Date(b?.soldDate) - new Date(a?.soldDate))?.map((v, i) => (
                                                            <tr key={i} className={v?.buyer_status==="paid"?"paid":"unpaid"}>
                                                                <td>{v?.buyer_address}</td>
                                                                <td>{v?.veg_name}</td>
                                                                <td>{v?.sold}</td>
                                                                <td>{v?.amount}</td>
                                                                <td>{new Date(v?.soldDate).toLocaleDateString('en-IN')}</td>
                                                                <td><FaFilePdf size={22} onClick={()=>openModalBuyer(v)} className='border-0 pointer'/></td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">No results found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {isModalOpenBuyer && (
                                            <div className={`modal d-block modal-fullscreen ${isClosingBuyer ? 'fade-out' : 'fade-in'}`} tabIndex="-1">
                                                <div className="modal-dialog modal-fullscreen">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title text-center">Invoice</h5>
                                                            <button type="button" className="btn-close" onClick={closeModalBuyer}></button>
                                                        </div>
                                                        <InvoiceBuyer data={invoiceDataBuyer} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>}

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

export default Transactions