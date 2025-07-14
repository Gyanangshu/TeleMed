import Logo from '@/UI/Logo';
import React, { useState, useRef, useEffect } from 'react';
import { LuMenu } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";

const Navbar = () => {

    const [menuActive, setMenuActive] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuActive(false);
            }
        };

        if (menuActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuActive]);

    // Close menu on nav item click
    const handleNavClick = () => setMenuActive(false);


    return (
        <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-medical-200 rounded-full px-8 py-3 z-50 shadow-lg">
            <div className="flex items-center md:space-x-16 space-x-6">
                <Logo bgheight={"h-8"} bgwidth={"w-8"} logoheight={"h-5"} logowidth={"w-5"} text={"text-lg font-bold text-medical-900"}/>
                
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <a
                        href="#about"
                        className="text-medical-700 hover:text-medical-900 transition-colors"
                    >
                        About
                    </a>
                    <a
                        href="#features"
                        className="text-medical-700 hover:text-medical-900 transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#tech"
                        className="text-medical-700 hover:text-medical-900 transition-colors"
                    >
                        Tech
                    </a>
                    <button className="text-sm bg-medical-600 hover:bg-medical-700 text-white rounded-3xl py-2 px-4"
                    >
                        Demo
                    </button>
                </div>

                <div className='md:hidden' ref={menuRef}>
                    {menuActive ?
                        <RxCross2
                            onClick={() => setMenuActive(!menuActive)}
                            className='text-2xl text-medical-800 cursor-pointer' />
                        :
                        <LuMenu
                            onClick={() => setMenuActive(!menuActive)}
                            className='text-2xl text-medical-800 cursor-pointer' />
                    }
                    {menuActive && (
                        <div className='absolute right-0 top-14 bg-white p-6 flex flex-col items-center gap-3 w-full border border-medical-300 rounded-xl mt-2 shadow-lg'>
                            <a
                                href="#about"
                                onClick={handleNavClick}
                                className="text-medical-700 hover:text-medical-900 transition-colors"
                            >
                                About
                            </a>
                            <a
                                href="#features"
                                onClick={handleNavClick}
                                className="text-medical-700 hover:text-medical-900 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#tech"
                                onClick={handleNavClick}
                                className="text-medical-700 hover:text-medical-900 transition-colors"
                            >
                                Tech
                            </a>
                            <button className="text-sm bg-medical-600 hover:bg-medical-700 text-white rounded-3xl py-2 px-4 mt-2 w-full"
                            >
                                Demo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
