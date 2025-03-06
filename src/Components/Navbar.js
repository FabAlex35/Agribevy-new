"use client"
import React, { useRef, useState } from 'react'
import { FaCircleUser } from "react-icons/fa6";
import logo from "../app/Assets/images/log.png"
import { MdOutlineLogout } from "react-icons/md";
import Link from 'next/link';
import { logoutUserAPI } from './Api';
import { useRouter } from 'next/navigation';
import { FaUserCog } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'

const NavBar = ({ userName, role, translations, app_language }) => {
    const [load, setLoad] = useState(false)
    const [errMsg, setErrMsg] = useState(null)
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const onLogOut = async () => {
        setLoad(true)
        const response = await logoutUserAPI()
        if (response?.status === 200) {
            router.push("/")
        }
        else {
            setLoad(false)
            setErrMsg(response?.message)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    const userDetails = () => {
        setIsOpen(pre => !pre)
    }

    const userDetailsRef = useRef(null);

    return (
        <header>
            <div className="container-fluid">
                <div className="row align-items-center justify-content-center">
                    <div className="col-5 col-md-3 navlogo">
                        <img src={logo.src} alt="load" className="zedge_logo" onClick={() => router.push("/portal/dashboard")} />
                    </div>

                    <div className="col-7 col-md-9 d-flex justify-content-end align-items-center">
                        <div className="d-flex align-items-center gap-3 me-2">
                            <div className="name-panel ">
                                <div className='user-name'>{userName}</div>
                                <div className="position">{role}</div>
                            </div>

                            <div className="dropdown right">
                                <span className="avatar" onClick={userDetails} ref={userDetailsRef}>
                                    <FaCircleUser size={28} className="nav_icon" />
                                </span>
                                <ul className={isOpen ? "showLogout" : "hideLogout"}>

                                    <li>
                                        <Link href="/portal/mydetails" onClick={userDetails}>
                                            <FaUserCog size={24} className="user_icons" /> {translations[app_language]?.myAccount}
                                        </Link>
                                    </li>

                                    <li className="divider"></li>
                                    <li>
                                        <span onClick={onLogOut}>
                                            <MdOutlineLogout size={24} className="user_icons" />{load ? translations[app_language]?.loggingOut : translations[app_language]?.logOut}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className={errMsg === null ? "alert_net hide_net" : "alert_net show alert_war_bg"} >
                <RxCrossCircled className='exclamation-circle' />
                <span className="msg">{errMsg}</span>
                <div className="close-btn close_war">
                    <IoClose className='close_mark' size={26} />
                </div>
            </div>
        </header>
    )
}

export default NavBar