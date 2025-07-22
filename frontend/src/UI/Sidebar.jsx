import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { LuLogOut, LuMenu } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";

const Sidebar = ({ userData, navigation, activeTab, onTabChange }) => {
    const { logout } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    console.log("user data sidbar: ", userData)

    return (
        <div className='flex flex-row-reverse'>
            {/* floating hamburger icon for small screens */}
            <button
                type='button'
                className={`fixed z-50 xl:hidden text-medical-800 bg-white p-3 rounded-full shadow-md shadow-medical-300 w-fit h-fit transition-all duration-300
             ${isOpen ? 'left-[calc(100%-4rem)] sm:left-[20rem] md:left-[21rem] sm:bottom-8 bottom-24' // when sidebar is open
                        :
                        'left-4 bottom-8' // when sidebar is closed
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ?
                    <IoMdClose className='text-2xl sm:text-4xl' />
                    :
                    <LuMenu className='text-2xl sm:text-4xl' />
                }
            </button>

            <div
                className={`w-80 px-6 h-screen flex flex-col justify-between border-r border-l border-medical-200 shadow-md shadow-medical-100
      fixed top-0 left-0 bg-white transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0 w-full md:w-80
      xl:static xl:flex`}
            >
                {/* brand logo */}
                <div className='py-4 mt-4'>
                    <Logo bgwidth={"w-11"} bgheight={"h-11"} logowidth={"w-7"} logoheight={"h-7"} text={"text-2xl font-bold text-medical-900"} />
                </div>

                {/* Navigation items */}
                <nav className="flex-1 py-4 mt-2">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => onTabChange(item.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-medical-100 to-emerald-200 text-medical-700 border border-medical-200'
                                            : 'text-medical-600 bg-medical-50 '
                                            }`}
                                    >
                                        <item.icon className="text-xl" strokeWidth="2.3" />
                                        <span className='text-lg font-medium'>{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className='bg-gradient-to-r from-medical-600 to-emerald-600 rounded-xl p-4 mb-2 text-white flex items-center justify-between'>
                    {/* User info header */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 text-white rounded-full flex items-center justify-center mb-1">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold">{userRole === 'doctor' ? `Dr. ${userName}` : userName}</p>
                            <p className="text-sm text-white/80">
                                {userData?.specialization ? userData.specialization : userRole}</p>
                        </div>
                    </div>

                    {/* Logout button */}
                    <button onClick={handleLogout} className="w-fit p-3 text-right hover:bg-white/20 text-white rounded-lg transition-colors">
                        <LuLogOut className='text-lg' />
                    </button>
                </div>


            </div>
        </div>
    );
}

export default Sidebar
