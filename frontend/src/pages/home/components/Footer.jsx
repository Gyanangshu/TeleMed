import React from 'react';
import { FiGithub } from "react-icons/fi";
import { LuLinkedin } from "react-icons/lu";
import { Link } from 'react-router-dom';
import Logo from '@/UI/Logo';

const Footer = () => {
    return (
        <footer className='bg-medical-900 text-white'>
            <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto pt-24'>
                <div>
                    <div className='flex flex-col gap-6'>
                        <Logo bgheight={"h-11"} bgwidth={"w-11"} logoheight={"h-7"} logowidth={"w-7"} text={"text-3xl font-bold"}/>

                        <p className='text-medical-200 max-w-2xl leading-relaxed text-[17px]'>Reimagining rural healthcare with real-time doctor access, powered by simple, scalable technology. Giving every patient—no matter how remote—the chance to be seen, heard, and treated with dignity.</p>

                        <div className="flex items-center gap-4 mt-2">
                            <Link to={"https://github.com/Gyanangshu"}>
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                    <FiGithub className="w-5 h-5" />
                                </div>
                            </Link>
                            <Link to={"https://www.linkedin.com/in/gyanangshu-misra-63136b18a/"} target='__blank'>
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                                    <LuLinkedin className="w-5 h-5" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className='border-t-2 border-medical-800 mt-12 pt-6 pb-12'>
                        <p className="text-base text-medical-200 ">
                            © 2025 TeleMed. Made with ❤️ by Gyanangshu Misra
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
