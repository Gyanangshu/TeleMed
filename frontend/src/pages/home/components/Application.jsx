import Badge from '@/UI/Badge';
import { LuBuilding } from "react-icons/lu";
import { LuTruck } from "react-icons/lu";
import { LuHospital } from "react-icons/lu";
import { LuSchool } from "react-icons/lu";
import { LuGlobe } from "react-icons/lu";
import { LuHeart } from "react-icons/lu";
import React from 'react'

const Application = () => {

    const appCards = [
        {
            icon: LuBuilding,
            title: "Government PHCs",
            desc: "Primary Health Centers in remote areas",
            label: "150+ Connected"
        },
        {
            icon: LuTruck,
            title: "Mobile Clinics",
            desc: "NGO-driven healthcare units",
            label: "50+ Deployments"
        },
        {
            icon: LuHospital,
            title: "Emergency Response",
            desc: "Disaster zone field hospitals",
            label: "24/7 Support"
        },
        {
            icon: LuSchool,
            title: "Emergency Response",
            desc: "Disaster zone field hospitals",
            label: "24/7 Support"
        },
        {
            icon: LuGlobe,
            title: "Pilot Programs",
            desc: "Government telemedicine trials",
            label: "5 States"
        },
        {
            icon: LuHeart,
            title: "Community Care",
            desc: "Local health worker support",
            label: "100+ Workers"
        },
    ]

    return (
        <div className='bg-gradient-to-br from-blue-50 via-white to-blue-50'>
            <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-24'>
                <div className='flex items-center justify-center flex-col gap-4'>
                    <Badge icon={"🌍"} text={"Applications"} />
                    <h2 className="text-4xl font-bold text-medical-900">
                        Real-world Impact
                    </h2>
                </div>


                <div className='mt-16 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
                    {appCards.map((item, index) => (
                        <div key={index} className='bg-white w-full p-8 flex gap-5 border border-medical-200 hover:border-medical-400 hover:shadow-lg shadow-medical-200 transition-all duration-200 ease-in-out rounded-xl '>
                            <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                                <item.icon className='z-10 text-2xl text-medical-700' />
                            </span>
                            <div className='flex flex-col gap-4 w-fit'>
                                <div className='flex flex-col '>
                                    <p className='text-xl font-semibold text-medical-900'>{item.title}</p>
                                    <p className='text-medical-700 max-w-2xl'>{item.desc}</p>
                                </div>
                                <span className='text-xs font-medium rounded-2xl bg-boxBg px-4 py-1 h-fit w-fit text-medical-800'>
                                    {item.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Application
