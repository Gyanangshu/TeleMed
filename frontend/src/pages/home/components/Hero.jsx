import React from 'react';
import { TbCircleArrowRightFilled } from "react-icons/tb";
import { FiGithub } from "react-icons/fi";
import Badge from '@/UI/Badge';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import operatorImg from "@/images/operatorForm.png";

const Hero = () => {

    const swiperImages = [
        {
            header: "OperatorDashboard.jsx",
            content: operatorImg
        },
        {
            header: "DoctorDashboard.jsx",
            content: operatorImg
        },
        {
            header: "AdminDashboard.jsx",
            content: operatorImg
        },
    ]

    return (
        <main className='h-full flex items-center bg-gradient-to-br from-blue-50 via-white to-blue-50'>
            <div className='flex w-full items-center px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-40'>
                {/* content */}
                <div className='w-full flex flex-col gap-6'>
                    {/* label  */}
                    <Badge icon={"🏥"} text={"Rural Healthcare Innovation"} />

                    <h1 className="text-6xl md:text-7xl font-bold text-medical-900 leading-tight">
                        Rural Health,
                        <br />
                        <span className="bg-gradient-to-r from-medical-600 via-emerald-600 to-medical-500 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>
                    <p className="text-xl text-medical-700 leading-relaxed max-w-2xl mt-1">
                        Connecting villages with specialists through real-time video
                        consultations. Bridging healthcare gaps with technology.
                    </p>
                    <div className='flex items-center gap-4 mt-6 md:flex-nowrap flex-wrap w-full'>
                        <Link to={"/login"} className='w-full md:w-fit'>
                            <button className='bg-medical-600 hover:bg-medical-700 text-white rounded-xl px-8 py-2 text-lg font-medium flex items-center justify-center md:justify-start gap-2 md:w-fit w-full group'>Try Now
                                <span className='mt-1 group-hover:translate-x-1 transition-transform pb-[3px]'>
                                    <TbCircleArrowRightFilled />
                                </span>
                            </button>
                        </Link>

                        <Link to={"https://github.com/Gyanangshu/TeleMed"} target={'_blank'} className='w-full md:w-fit'>
                            <button className='bg-white border px-8 py-2 text-lg font-medium border-medical-300 text-medical-700 hover:bg-medical-50 rounded-xl flex items-center justify-center md:justify-start gap-3 md:w-fit w-full'>
                                <span><FiGithub /></span>
                                View Code
                            </button>
                        </Link>
                    </div>
                </div>

                {/* app image */}
                <div className='w-full hidden xl:flex justify-center items-center'>
                    <Swiper
                        effect="cards"
                        grabCursor={true}
                        modules={[EffectCards, Autoplay]}
                        autoplay={{
                            pauseOnMouseEnter: true
                        }}
                        className="mySwiper w-[480px] h-[420px]"
                    >
                        {swiperImages.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="text-white rounded-xl overflow-hidden w-full">

                                    <div className="py-2 px-4 bg-medical-700 flex items-center gap-4 rounded-t-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="p-[6px] rounded-full bg-[#FF605C]"></span>
                                            <span className="p-[6px] rounded-full bg-[#FFBD44]"></span>
                                            <span className="p-[6px] rounded-full bg-[#00CA4E]"></span>
                                        </div>
                                        <p>{item.header}</p>
                                    </div>

                                    <div className="h-[380px] bg-white border border-medical-100">
                                        <img loading='lazy' src={item.content} alt={item.header} />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </main>
    )
}

export default Hero
