import Badge from '@/UI/Badge'
import React from 'react';
import { LuHospital } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { LuVideo } from "react-icons/lu";
import { CgFileDocument } from "react-icons/cg";

const Challenge = () => {

    const challenges = [
        {
            icon: LuHospital,
            title: "Rural PHCs"
        },
        {
            icon: FaRegHeart,
            title: "City Specialists"
        },
        {
            icon: LuVideo,
            title: "Live Connection"
        },
        {
            icon: CgFileDocument,
            title: "Digital Records"
        },
    ];

    return (
        <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-24' id='about'>

            <div className='flex items-center gap-2 w-full lg:flex-nowrap flex-wrap'>
                {/* content */}
                <div className='w-full flex flex-col gap-6'>
                    {/* label  */}
                    <Badge icon={"🎯"} text={"The Challenge"} />

                    <h2 className="text-5xl font-bold text-medical-900 leading-tight">
                        Breaking Down
                        <span className="block text-medical-600">
                            Healthcare Barriers
                        </span>
                    </h2>
                    <p className="text-lg text-medical-700 leading-relaxed">
                        In rural India, accessing specialist care means traveling
                        hundreds of kilometers. Our platform eliminates this barrier
                        through technology, connecting patients with qualified doctors
                        instantly.
                    </p>
                </div>

                {/* challenges box */}
                <div className='w-full h-full'>
                    <div className='xl:mx-12 mx-0 text-medical-700 font-medium rounded-xl bg-boxBg p-10 mt-12 lg:mt-0'>
                        <div className='grid md:grid-cols-2 grid-cols-1 lg:gap-5 gap-8'>
                            {challenges.map((item, index) => (
                                <div key={index} className='flex-1 bg-white w-full flex items-center justify-center flex-col gap-3 px-3 py-5 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-medical-200 '>
                                    <span className='rounded-xl bg-boxBg p-4'>
                                        <item.icon className='z-10 text-2xl' />
                                    </span>
                                    <p>{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Challenge
