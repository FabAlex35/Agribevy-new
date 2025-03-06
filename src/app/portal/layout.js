"use client"

import React, { useEffect, useState } from 'react'
import NavBar from '@/src/Components/Navbar'
import SideNav from '@/src/Components/SideNav'
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { getMySettingsAPI, getUserAPI, subsCkeck, subsUpdate } from '@/src/Components/Api';
import { useDispatch, useSelector } from 'react-redux';
import { getAppLanguageSlice, getSubscriptionData, getUserDetailsSlice, getUserLanguageSlice } from '../features/Slice';
const Wrapper = ({ children }) => {

    const [isOpen, setIsOpen] = useState(true);
    const nameChanged = useSelector((state) => state?.user?.nameChanged)
    const LanguageChanged = useSelector((state) => state?.user?.languageChanged)
    const appLanguageChanged = useSelector((state) => state?.user?.applanguageChanged)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_data = useSelector((state) => state?.user?.data)

    const dispatch = useDispatch()
    const [user, setUser] = useState(null)
    useEffect(() => {

        const windowSizeHandler = () => {
            if (window.innerWidth < 768) {
                setIsOpen(false)
            }
        };
        windowSizeHandler()
        window.addEventListener("resize", windowSizeHandler);
        return () => {
            window.removeEventListener("resize", windowSizeHandler);
        };

    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const getUserDetails = async () => {
        const response = await getUserAPI()
        if (response?.status === 200) {
            setUser(response?.data);
            dispatch(getUserDetailsSlice(response?.data))
        }
    }

    const languageDetails = async () => {
        const response = await getMySettingsAPI()
        if (response?.status === 200) {
            dispatch(getUserLanguageSlice(response?.data?.language))
            dispatch(getAppLanguageSlice(response?.data?.app_language))
        }
    }

    useEffect(() => {
        getUserDetails()
    }, [nameChanged])
    useEffect(() => {
        languageDetails()
    }, [LanguageChanged, appLanguageChanged])

    const confirm = async () => {
        const response = await subsUpdate();
        if (response?.status === 200) {
            const responses = await subsCkeck();
            if (responses?.status === 200) {
                dispatch(getSubscriptionData(responses?.data))
            }
        }
    }

    return (
        <>
            <section className="main">
                <NavBar userName={user?.user_name} role={user?.user_role} translations={translations} app_language={app_language} />
                <SideNav isOpen={isOpen} role={user?.user_role} access={user?.access} translations={translations} app_language={app_language} />
                <div className={!isOpen ? "menu active" : "menu"} onClick={toggleSidebar}>
                    {isOpen && <IoIosArrowDropleftCircle />}
                    {!isOpen && <IoIosArrowDroprightCircle />}
                </div>
                <div className={!isOpen ? "main-wrap active" : "main-wrap"}>
                    {children}
                </div>
                {sub_data?.days <= 10 && sub_data?.is_show &&
                    <div className='modal_box d-flex justify-content-center align-item-center'>
                        <div className='col-8 m-auto modal_content'>
                            <div className='col-5 info_page'>
                                <svg
                                    viewBox="0 0 464 390.4"
                                    style={{ enableBackground: 'new 0 0 464 390.4' }}
                                    xmlSpace="preserve"
                                >
                                    <circle className="st0" cx="126" cy="175.4" r="12" />
                                    <circle className="st0" cx="339" cy="175.4" r="12" />
                                    <circle className="st1" cx="232.5" cy="170.9" r="106.5" />
                                    <path
                                        className="st2"
                                        d="M126,164.4c0,0,4.5-15.4,10.5-19.6c0,0,31,0,65-26.5c0,0,110,85.9,176-30.8c0,0-33,28.6-116-41.4c0,0-131-16.2-135.5,106V164.4z"
                                    />
                                    <path
                                        className="st2"
                                        d="M339,164.4c0,0,6.2-13.3-8.2-32.4l-6.3,3.9C324.5,135.9,333.5,142.9,339,164.4z"
                                    />
                                    <path className="st2" d="M247.8,45.3c0,0,47.7-5.3,76.7,53.7L247.8,45.3z" />
                                    <circle className="st2" cx="192" cy="175.4" r="9" />
                                    <circle className="st2" cx="271" cy="175.4" r="9" />
                                    <path
                                        className="st4"
                                        d="M101.4,390.1c22.1-106.8,75.7-114.1,137.1-114.1c61.4,0,104,18.8,130.1,114.1C368.7,390.6,101.3,390.6,101.4,390.1z"
                                    />

                                    <path
                                        className="smile"
                                        d="M191,214.4c-1.1-1.5,38.6,49.3,83,0"
                                        fill="none"
                                        stroke="#473427"
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                        strokeMiterlimit="10"
                                    />
                                </svg>
                            </div>
                            <div className="message col-7">
                                <h1>Your subscription is about to expire</h1>
                                <p>Your subscription expired in 10 days. To continue using our services, please update your subscription.</p>
                                <div class="button-box mt-4">
                                    <button class="modal_btn" onClick={confirm}>Continue</button>
                                </div>
                            </div>
                        </div>

                    </div>}
            </section>
        </>
    )
}

export default Wrapper

