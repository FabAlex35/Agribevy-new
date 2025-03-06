"use client"
import { getCommodityAPI, getFarmerAPI, getInventoryAPI, getSackAPI } from '@/src/Components/Api';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5'
import Loader from '@/src/Components/Loader';
import Spinner from '@/src/Components/Spinner';
import { useSelector } from 'react-redux';
import AddInventoryTable from '@/src/Components/InventoryTable';
import { MdDeleteOutline } from 'react-icons/md';
import { CiEdit } from "react-icons/ci";
import { FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const Inventory = () => {
  const user = useSelector((state) => state?.user?.userDetails)
  const language = useSelector((state) => state?.user?.language)
  const app_language = useSelector((state) => state?.user?.app_language)
  const translations = useSelector((state) => state?.language?.translations)
  const sub_status = useSelector((state) => state?.user?.subscription)
  const [noFarmer, setNoFarmer] = useState(false)
  const [noProduct, setNoProduct] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [searchProduct, setSearchProduct] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errMsg, setErrMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tableData, setTableData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [add, setAdd] = useState(false)
  const [sacks, setSacks] = useState(null)

  const filteredData = tableData?.filter((item) =>
    item.veg_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const router=useRouter()
  const inventoryList = async () => {
    setLoading(true)
    setAdd(false)
    const response = await getInventoryAPI()
    if (response?.status === 200) {
      setTableData(response?.data);
      setLoading(false)
    }
    else {
      setErrMsg(response?.message)
      setLoading(false)
      setTimeout(() => {
        setErrMsg(null)
      }, 2000)
    }
  }


  const getFarmerList = async () => {
    const response = await getFarmerAPI()
    if (response?.status === 200) {
      setSearchResult(response?.data)
      if (!response?.data?.length) {
        setNoFarmer(true)
      }
      else {
        setNoFarmer(false)
      }
    }
    else {
      setErrMsg(response?.message)
      setTimeout(() => {
        setErrMsg(null)
      }, 2000)
    }
  }

  const getSackList = async () => {
    const response = await getSackAPI()
    if (response?.status === 200) {
      setSacks(response?.data)
    }
    else {
      setErrMsg(response?.message)
      setTimeout(() => {
        setErrMsg(null)
      }, 2000)
    }
  }

  const getProductList = async () => {

    const response = await getCommodityAPI()
    if (response?.status === 200) {
      setSearchProduct(response?.data)
      if (!response?.data?.length) {
        setNoProduct(true)
      }
      else {
        setNoProduct(false)
      }
    }
    else {
      setErrMsg(response.message)
      setTimeout(() => {
        setErrMsg(null)
      }, 2000)
    }
  }



  useEffect(() => {
    getFarmerList()
    inventoryList()
    getProductList()
    getSackList()
  }, [])


  return (
    <div className='app-container'>
      {loading ? <Loader /> :
        <>
          <div className='head pt-2 d-flex align-items-center justify-content-between'>
            <button className='submit-btn py-2 requirement-btn px-2' onClick={()=>router.push("/portal/dashboard")}>{translations[app_language]?.back}</button>
            <h2 className='primary-color text-center flex-grow-1 m-0'>
              {translations[app_language]?.myItems}
            </h2>
          </div>
          {/* <DynamicTable/> */}
          {(user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.inventory || user?.access?.accounts))) && (noFarmer || noProduct) ?
            <>
              {(noFarmer && !noProduct) &&
                <>
                  <h4 className='mt-5 text-center text-danger'>No farmer found.Please <Link href="/portal/farmers" className='text-success text-decoration-underline'>ADD FARMER</Link> to add inventory</h4>
                </>
              }
              {(noProduct && !noFarmer) &&
                <>
                  <h4 className='mt-5 text-center text-danger'>No product found.Please <Link href="/portal/products" className='text-success text-decoration-underline'>ADD PRODUCT</Link> to add inventory</h4>
                </>
              }
              {(noFarmer && noProduct) &&
                <>
                  <h4 className='mt-5 text-center text-danger'>No farmer and product found.Please <Link href="/portal/farmers" className='text-success text-decoration-underline'>ADD FARMER</Link> & <Link href="/portal/products" className='text-success text-decoration-underline'>ADD PRODUCT</Link> to add inventory</h4>
                </>
              }
            </>
            :
            <>
              {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.inventory || user?.access?.accounts)) ?
                <div className='d-flex justify-content-end mt-4'>
                  {/* <button className='submit-btn py-2' onClick={() => setIsOffCanvasOpen(true)}>Add inventory</button> */}
                  {(!add) &&
                    <>
                      {sub_status ? 
                        <button className='submit-btn py-2 ms-2' onClick={() => {
                        setAdd(true)
                      }}>{translations[app_language]?.addInventory}</button> 
                      : 
                      ""
                    }

                    </>
                  }
                  {add &&

                    <button className='submit-btn py-2 px-2' onClick={() => setAdd(false)}>{translations[app_language]?.viewInventory}</button>}
                </div> : ""}
              {add ?
                <AddInventoryTable searchProduct={searchProduct} searchFarmer={searchResult} viewInventory={inventoryList} language={language} sacks={sacks} appLanguage={app_language} translations={translations} />
                :
                <>
                  <div className='d-flex justify-content-end mt-3' >

                    <input
                      type="text"
                      className=' search-input'
                      placeholder={translations[app_language]?.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="inventory-container">
                    <div className="row">
                      {filteredData?.length > 0 ? (
                        filteredData?.map((v, i) => (
                          <div className="col-md-6 col-lg-4" key={i}>
                            <div className="inventory-card">
                              <div className="inventory-header">
                                {language === "tamil" ? v?.tamil_name : v.veg_name}
                              </div>
                              <div className="inventory-body">
                                <div className="inventory-category">
                                  {translations[app_language]?.vegetable}
                                </div>
                                <div className="inventory-stock">
                                  {v.total_remaining} <span>{translations[app_language]?.kg}</span>

                                </div>
                                {(user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.sales || user?.access?.accounts))) &&
                                  <Link href={`/portal/inventory/${language === "tamil" ? v?.tamil_name : v.veg_name}/${v.vegetable_id}`} className="inventory-btn">{translations[app_language]?.viewInventory}</Link>

                                }
                              </div>
                            </div>
                          </div>)))
                        : (

                          <p className='text-danger fw-bold fs-3 text-center'>{translations[app_language]?.noStocks}</p>
                        )}
                    </div>
                  </div>
                </>}

            </>
          }



        </>}
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
    </div>
  )
}

export default Inventory;