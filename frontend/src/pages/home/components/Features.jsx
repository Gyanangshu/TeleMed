import Badge from '@/UI/Badge';
import React from 'react';
import { LuVideo } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { LuShield } from "react-icons/lu";
import { CgFileDocument } from "react-icons/cg";
import { LuChartColumn } from "react-icons/lu";

const Features = () => {

    const features = [
        {
            icon: LuVideo,
            title: "WebRTC Real-time Video",
            description: "Crystal clear, low-latency video calls optimized for rural internet connections. Built for reliability in challenging network conditions",
            flags: ["HD Quality", "Low Bandwidth", "Auto-adapts"]
        }
    ];

    const features2 = [
        {
            icon: LuShield,
            title: "HIPAA Compliant",
            description: "End-to-end encrypted communications",
        },
        {
            icon: CgFileDocument,
            title: "Digital Referrals",
            description: "PDF reports and referral system",
        },
        {
            icon: LuChartColumn,
            title: "Admin Dashboard",
            description: "Real-time analytics and monitoring",
        },
    ]

    return (
        <div id='features'>
            <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-24'>
                <div className='flex items-center justify-center flex-col gap-4'>
                    <Badge icon={"🚀"} text={"Features"} />
                    <h2 className="text-4xl text-center font-bold text-medical-900">
                        Powerful Capabilities
                    </h2>
                </div>

                <div className='mt-16 flex flex-wrap gap-6'>
                    {features.map((item, index) => (
                        <div key={index} className='bg-white w-fit p-8 flex justify-center md:flex-row flex-col gap-5 border border-medical-200 hover:border-medical-400 hover:shadow-lg shadow-medical-200 transition-all duration-200 ease-in-out rounded-xl'>
                            <span className='rounded-xl bg-boxBg p-4 h-fit w-fit'>
                                <item.icon className='z-10 text-3xl text-medical-700' />
                            </span>
                            <div className='flex flex-col gap-4 w-fit'>
                                <div className='flex flex-col gap-1'>
                                    <p className='text-2xl font-semibold text-medical-900'>{item.title}</p>
                                    <p className='text-medical-700 text-md max-w-2xl'>{item.description}</p>
                                </div>
                                <span className='flex flex-wrap gap-10'>
                                    {item.flags && item.flags.map((flag, key) => (
                                        <ul key={key} className='text-sm text-medical-600 list-inside list-disc'>
                                            <li>{flag}</li>
                                        </ul>
                                    ))}
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className='bg-white w-fit p-8 flex flex-col justify-center gap-4 border border-medical-200 hover:border-medical-400 hover:shadow-lg shadow-medical-200 transition-all duration-200 ease-in-out rounded-xl flex-1'>
                        <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                            <FiUsers className='z-10 text-2xl text-medical-700' />
                        </span>
                        <div className='flex flex-col gap-4 w-fit'>
                            <div className='flex flex-col gap-1'>
                                <p className='text-2xl font-semibold text-medical-900'>Role-based Access</p>
                                <p className='text-medical-700 text-md'>Secure login for Admins, Doctors, and Operators</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex xl:flex-row flex-col items-center gap-6 mt-6'>
                    {features2.map((item, index) => (
                        <div key={index} className='bg-white w-full p-8 flex flex-col justify-center gap-4 border border-medical-200 hover:border-medical-400 hover:shadow-lg shadow-medical-200 transition-all duration-200 ease-in-out rounded-xl flex-1'>
                        <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                            <item.icon className='z-10 text-2xl text-medical-700' />
                        </span>
                        <div className='flex flex-col gap-4 w-fit'>
                            <div className='flex flex-col gap-1'>
                                <p className='text-2xl font-semibold text-medical-900'>{item.title}</p>
                                <p className='text-medical-700 text-md'>{item.description}</p>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Features
