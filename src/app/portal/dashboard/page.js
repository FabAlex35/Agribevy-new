"use client"
import { dashboardAPI, getMyTransactionsAPI } from '@/src/Components/Api';
import React, { useEffect, useState } from 'react'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import Loader from '@/src/Components/Loader';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import DashboardCard from '@/src/Components/DashboardCard';
import TabButton from '@/src/Components/TabButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [period, setPeriod] = useState('day');
    const [details, setDetails] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState(null)
    const [tableData, setTableData] = useState(null);

    const router = useRouter()
    const user = useSelector((state) => state?.user?.userDetails)
    const language = useSelector((state) => state?.user?.language)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const getAllTransactions = async () => {

        setLoading(true)
        const response = await getMyTransactionsAPI()
        if (response?.status === 200) {
            const sortedData = response?.data
                .sort((a, b) => new Date(b?.soldDate) - new Date(a?.soldDate))
                .slice(0, 5);
            setTableData(sortedData)
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


    const getDashboardDetails = async () => {
        setLoading(true)
        const response = await dashboardAPI()
        if (response?.status === 200) {
            setLoading(false)
            setDetails(response?.data)
            const weekData = response?.data?.week?.map(item => ({
                name: item.name,
                sales: parseFloat(item.sales)
            }));

            const monthData = response?.data?.month?.map(item => ({
                name: item.name,
                sales: parseFloat(item.sales)
            }));

            const data = {
                week: weekData,
                month: monthData
            };
            setChartData(data)
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
        const role = localStorage.getItem('role')
  
        if (role) {
            getDashboardDetails();
            if (role === 'marketer' || role === 'assistant') {
                getAllTransactions();
            }
        }
    }, []);


    return (
        <div className='app-container'>
            {loading ? <Loader /> :
                <>
                    <div className='head pt-2 text-center '>
                        <h2 className='primary-color '>{translations[app_language]?.welcome}, {details?.name?.user_name}</h2>
                    </div>

                    <>
                        <div className='d-flex justify-content-between flex-wrap mb-4'>

                            <div className="">
                                <TabButton
                                    active={period === 'day'}
                                    onClick={() => setPeriod('day')}
                                >
                                    {translations[app_language]?.today}
                                </TabButton>
                                <TabButton
                                    active={period === 'week'}
                                    onClick={() => setPeriod('week')}
                                >

                                    {translations[app_language]?.week}
                                </TabButton>
                                <TabButton
                                    active={period === 'month'}
                                    onClick={() => setPeriod('month')}
                                >
                                    {translations[app_language]?.month}
                                </TabButton>
                            </div>


                        </div>
                        {period === "day" ?
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <DashboardCard
                                        title= {translations[app_language]?.totalRevenue}
                                        value={details?.today?.amount || 0}
                                        symbol="₹"
                                        change={3.7}
                                    />

                                    <DashboardCard
                                        title={translations[app_language]?.totalCommodity}
                                        value={details?.today?.count}
                                        symbol="#"
                                        change={1.5}
                                    />
                                </div>
                                {(user?.user_role === "marketer" || user?.user_role === "assistant") &&
                                    <>
                                        <h5>{app_language === "tamil" ? "சமீபத்திய பரிவர்த்தனைகள்" : " Recent Transactions"}</h5>
                                        <div className="table-container mt-3">
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>{translations[app_language]?.farmer}</th>
                                                        <th>{translations[app_language]?.vegetable}</th>
                                                        <th>{translations[app_language]?.weight}</th>
                                                        <th>{translations[app_language]?.amount}</th>
                                                        <th>{translations[app_language]?.buyer}</th>
                                                        <th>{translations[app_language]?.date}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData?.length > 0 ? (
                                                        tableData?.sort((a, b) => new Date(b?.soldDate) - new Date(a?.soldDate))?.map((v, i) => (
                                                            <tr key={i}>
                                                                <td>{v?.farmer_name}</td>
                                                                <td>{language === "tamil" ? v?.tamil_name : v?.veg_name}</td>
                                                                <td>{v?.sold}</td>
                                                                <td>{v?.amount}</td>
                                                                <td>{v?.buyer_name}-{v?.buyer_address}</td>
                                                                <td>{new Date(v?.soldDate).toLocaleDateString('en-IN')}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">No recent transactions found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                }
                            </>
                            :
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <DashboardCard
                                        title={translations[app_language]?.totalRevenue}
                                        value={period === 'week' ? details?.eachWeek?.amount || 0 : details?.eachMonth?.amount || 0}
                                        symbol="₹"
                                        change={period === 'week' ? 5.2 : 3.7}
                                    />
                                    <DashboardCard
                                        title={translations[app_language]?.totalCommodity}
                                        value={period === 'week' ? details?.eachWeek?.count : details?.eachMonth?.count}
                                        symbol="#"
                                        change={period === 'week' ? -2.1 : 1.5}
                                    />
                                </div>
                                {period === "week" ?
                                    <>
                                        {(chartData && chartData?.week?.length > 0) &&
                                            <div className="bg-white p-4 rounded-lg shadow">
                                                <h2 className="text-lg font-semibold mb-4">{translations[app_language]?.salesOverview}</h2>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={chartData[period]}>
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Bar dataKey="sales" fill="#627723" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>}
                                    </> :
                                    <>
                                        {(chartData && chartData?.month?.length > 0) &&
                                            <div className="bg-white p-4 rounded-lg shadow">
                                                <h2 className="text-lg font-semibold mb-4">{translations[app_language]?.salesOverview}</h2>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={chartData[period]}>
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Bar dataKey="sales" fill="#627723" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>}
                                    </>}

                            </>
                        }
                    </>
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

export default Dashboard