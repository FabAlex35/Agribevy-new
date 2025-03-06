"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { MdManageSearch } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import { BiSolidUserDetail } from "react-icons/bi";
import { GiFarmer } from "react-icons/gi";
import { FaList } from "react-icons/fa";
import { GiOrganigram } from "react-icons/gi";
import { IoSettings } from "react-icons/io5";
import { TbTransactionRupee } from "react-icons/tb";
import { GiTomato } from "react-icons/gi";
import { FcSalesPerformance } from "react-icons/fc";
import { IoStatsChartSharp } from "react-icons/io5";
import { FaFileInvoiceDollar, FaStore } from "react-icons/fa6";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { VscChecklist } from 'react-icons/vsc';
import { MdOutlineCurrencyExchange } from "react-icons/md";
import { HiCurrencyRupee } from "react-icons/hi";
import { GrNotes } from 'react-icons/gr';
import { getMySettingsAPI, subsCkeck } from './Api';
import { getBillMode, getSubscription, getSubscriptionData } from '../app/features/Slice';
import { useDispatch } from 'react-redux';
const SideNav = ({ isOpen, role, access, translations, app_language }) => {
    const pathname = usePathname()
    const dispatch = useDispatch()
    const [isNavigationAllowed,setIsNavigationAllowed] = useState(null); 
    const router = useRouter()     

    const subsApicall = async()=>{
        const response = await subsCkeck();
        if (response?.status === 200) {
            dispatch(getSubscription(response?.data?.sub_status))
            dispatch(getSubscriptionData(response?.data))
        }     
    }

    const getSettings = async () => {
            const response = await getMySettingsAPI()
            if (response?.status === 200) {
                setIsNavigationAllowed(true)
                const datas = {
                    bill_type: response.data.bill_type,
                    show: response.data.magamai_show,
                    type: response.data.magamaiSource
                }
                dispatch(getBillMode(datas))
                return
            }
            else if(response?.status === 404) {
                setFlag(false)
                router.push("/portal/settings")
                return
            }
        }
    
    useEffect(()=>{
       subsApicall() 
       getSettings()
    },[])

      const getLinkClass = () => {
          if (!isNavigationAllowed) {
              return 'side-link disabled';
          }
          return 'side-link'
      }
  
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-side">{isOpen ? "Quick access" : <MdManageSearch />}</div>
            </div>
            <div className="sidebar-nav">
                {isOpen &&
                    <ul className='sidebar-list'>

                        <Link href="/portal/dashboard" className={getLinkClass()}><li className={`${pathname === "/portal/dashboard" ? 'active nav-link' : "nav-link"}`}><BiSolidDashboard size={16} />&nbsp; {translations[app_language]?.dashboard}</li></Link>
                        {(role === "marketer" || role === "assistant") &&
                            <>
                                <Link href="/portal/inventory" className={getLinkClass()}><li className={`${pathname === "/portal/inventory" ? 'active nav-link' : "nav-link"}`}><MdOutlineLocalGroceryStore size={16} />&nbsp;{translations[app_language]?.myItems}</li></Link>

                                {(role === "marketer" || (role === "assistant" && (access?.inventory || access?.accounts))) &&
                                    <>
                                        <Link href="/portal/farmers" className={getLinkClass()}><li className={`${pathname === "/portal/farmers" ? 'active nav-link' : "nav-link"}`}><GiFarmer size={16} />&nbsp;{translations[app_language]?.myFarmers}</li></Link>

                                        <Link href="/portal/products" className={getLinkClass()}><li className={`${pathname === "/portal/products" ? 'active nav-link' : "nav-link"}`}><GiTomato size={16} />&nbsp;{translations[app_language]?.myProducts}</li></Link>
                                    </>}

                                {(role === "marketer" || (role === "assistant" && (access?.sales || access?.accounts))) &&
                                    <>
                                        <Link href="/portal/buyers" className={getLinkClass()}><li className={`${pathname === "/portal/buyers" ? 'active nav-link' : "nav-link"}`}><BiSolidUserDetail size={16} />&nbsp;{translations[app_language]?.myBuyers}</li></Link>
                                        <Link href="/portal/sales" className={getLinkClass()}><li className={`${pathname === "/portal/sales" ? 'active nav-link' : "nav-link"}`}><MdOutlineCurrencyExchange size={16} />&nbsp;{translations[app_language]?.sales}</li></Link>

                                        <Link href="/portal/invoices" className={getLinkClass()}><li className={`${pathname === "/portal/invoices" ? 'active nav-link' : "nav-link"}`}><FaFileInvoiceDollar size={16} />&nbsp;{translations[app_language]?.bills}</li></Link>
                                    </>
                                }


                                {(role === "marketer" || (role === "assistant" && (access?.accounts))) &&
                                    <>


                                        <Link href="/portal/expenses" className={getLinkClass()}><li className={`${pathname === "/portal/expenses" ? 'active nav-link' : "nav-link"}`}><HiCurrencyRupee size={16} />&nbsp;{translations[app_language]?.expenses}</li></Link>

                                        <Link href="/portal/accounts" className={getLinkClass()}><li className={`${pathname === "/portal/accounts" ? 'active nav-link' : "nav-link"}`}><TbTransactionRupee size={16} />&nbsp;{translations[app_language]?.reports}</li></Link>

                                    </>
                                }
                            </>
                        }

                        {role === "marketer" &&
                            <>
                                <Link href="/portal/assistants" className={getLinkClass()}><li className={`${pathname === "/portal/assistants" ? 'active nav-link' : "nav-link"}`}><GiOrganigram size={16} />&nbsp;{translations[app_language]?.myAssistants}</li></Link>

                                <Link href="/portal/settings"><li className={`${pathname === "/portal/settings" ? 'active nav-link' : "nav-link"}`}><IoSettings size={16} />&nbsp;{translations[app_language]?.settings}</li></Link>
                            </>}

                        {(role === "farmer") &&
                            <>
                                <Link href="/portal/salesinfo" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfo" ? 'active nav-link' : "nav-link"}`}><IoStatsChartSharp size={16} />&nbsp;My Sales</li></Link>

                                <Link href="/portal/farmerinvoices" className={getLinkClass()}><li className={`${pathname === "/portal/farmerinvoices" ? 'active nav-link' : "nav-link"}`}><FaFileInvoiceDollar size={16} />&nbsp;My Invoices</li></Link>
                            </>
                        }

                        {(role === "buyer") &&
                            <>
                                <Link href="/portal/salesinfobuyer" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfobuyer" ? 'active nav-link' : "nav-link"}`}><BiSolidPurchaseTag size={16} />&nbsp;My Purchases</li></Link>

                                <Link href="/portal/buyerrequirements" className={getLinkClass()}><li className={`${pathname === "/portal/buyerrequirements" ? 'active nav-link' : "nav-link"}`}><VscChecklist size={16} />&nbsp;My Requirements</li></Link>

                                <Link href="/portal/marketers" className={getLinkClass()}><li className={`${pathname === "/portal/marketers" ? 'active nav-link' : "nav-link"}`}><FaStore size={16} />&nbsp;Marketers</li></Link>

                                <Link href="/portal/manualbill" className={getLinkClass()}><li className={`${pathname === "/portal/manualbill" ? 'active nav-link' : "nav-link"}`}><GrNotes size={16} />&nbsp;Manual Bill</li></Link>
                            </>}
                    </ul>
                }
                {!isOpen &&
                    <ul className='sidebar-list'>
                        <Link href="/portal/dashboard" title="Dashboard" className={getLinkClass()}><li className={`${pathname === "/portal/dashboard" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><BiSolidDashboard size={28} /></li></Link>
                        {(role === "marketer" || role === "assistant") &&
                            <>
                                <Link href="/portal/inventory" title="Inventory" className={getLinkClass()}><li className={`${pathname === "/portal/inventory" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><MdOutlineLocalGroceryStore size={28} />
                                </li></Link>

                                {(role === "marketer" || (role === "assistant" && (access?.inventory || access?.accounts))) &&
                                    <>
                                        <Link href="/portal/farmers" title="Farmers" className={getLinkClass()}><li className={`${pathname === "/portal/farmers" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><GiFarmer size={28} /></li></Link>
                                        <Link href="/portal/products" title="Products" className={getLinkClass()}><li className={`${pathname === "/portal/products" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><GiTomato size={28} /></li></Link>
                                    </>}

                                {(role === "marketer" || (role === "assistant" && (access?.sales || access?.accounts))) &&
                                    <>
                                        <Link href="/portal/buyers" title="Buyers" className={getLinkClass()}><li className={`${pathname === "/portal/buyers" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><BiSolidUserDetail size={28} /></li></Link>

                                        <Link href="/portal/sales" title="sales" className={getLinkClass()}><li className={`${pathname === "/portal/sales" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><MdOutlineCurrencyExchange size={28} /></li></Link>

                                        <Link href="/portal/invoices" title="invoices" className={getLinkClass()}><li className={`${pathname === "/portal/invoices" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><FaFileInvoiceDollar size={28} /></li></Link>
                                    </>
                                }



                                {(role === "marketer" || (role === "assistant" && (access?.accounts))) &&
                                    <>


                                        <Link href="/portal/expenses" title="expenses" className={getLinkClass()}><li className={`${pathname === "/portal/expenses" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><HiCurrencyRupee size={28} /></li></Link>

                                        <Link href="/portal/accounts" title="reports" className={getLinkClass()}><li className={`${pathname === "/portal/accounts" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><TbTransactionRupee size={28} /></li></Link>


                                    </>
                                }
                            </>}

                        {role === "marketer" &&
                            <>
                                <Link href="/portal/assistants" title="Assistants" className={getLinkClass()}><li className={`${pathname === "/portal/assistants" ? 'active nav-link p-0 ps-3 py-2' : "nav-link p-0 ps-3 py-3"}`}><GiOrganigram size={28} /></li></Link>

                                <Link href="/portal/settings" title="Settings"><li className={`${pathname === "/portal/settings" ? 'active nav-link p-0 ps-3 py-2' : "nav-link p-0 ps-3 py-3"}`}><IoSettings size={28} /></li></Link>
                            </>}

                        {(role === "farmer") &&
                            <>
                                <Link href="/portal/salesinfo" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfo" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><IoStatsChartSharp size={28} /></li></Link>

                                <Link href="/portal/farmerinvoices" className={getLinkClass()}><li className={`${pathname === "/portal/farmerinvoices" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><FaFileInvoiceDollar size={28} /></li></Link>
                            </>}

                        {(role === "buyer") &&
                            <>
                                <Link href="/portal/salesinfobuyer" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfobuyer" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><IoStatsChartSharp size={28} /></li></Link>

                                <Link href="/portal/buyerrequirements" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfobuyer" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><VscChecklist size={28} /></li></Link>

                                <Link href="/portal/marketers" className={getLinkClass()}><li className={`${pathname === "/portal/salesinfobuyer" ? 'active nav-link p-0 ps-3 py-3' : "nav-link p-0 ps-3 py-3"}`}><FaStore size={28} /></li></Link>
                            </>}
                    </ul>
                }
            </div>
        </div>
    )
}

export default SideNav