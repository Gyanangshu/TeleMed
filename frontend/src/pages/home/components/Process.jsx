import React from 'react'
import Badge from '@/UI/Badge'
import { FiUsers } from "react-icons/fi";
import { LuPhone } from "react-icons/lu";
import { LuVideo } from "react-icons/lu";
import { LuHeart } from "react-icons/lu";
import { CgFileDocument } from "react-icons/cg";

const Process = () => {

    const workingSteps = [
        {
            step: "01",
            title: "Operator Login",
            desc: "Village healthcare worker logs into the secure platform",
            icon: FiUsers,
            color: "medical",
            bgGradient: "from-medical-500 to-medical-600",
        },
        {
            step: "02",
            title: "Doctor Alert",
            desc: "City specialist receives instant push notification",
            icon: LuPhone,
            color: "emerald",
            bgGradient: "from-emerald-500 to-emerald-600",
        },
        {
            step: "03",
            title: "Video Connect",
            desc: "Patient connected via secure WebRTC video call",
            icon: LuVideo,
            color: "medical",
            bgGradient: "from-medical-500 to-medical-600",
        },
        {
            step: "04",
            title: "Live Consult",
            desc: "Doctor examines patient and provides diagnosis",
            icon: LuHeart,
            color: "emerald",
            bgGradient: "from-emerald-500 to-emerald-600",
        },
        {
            step: "05",
            title: "Digital Record",
            desc: "Consultation logged with referral if needed",
            icon: CgFileDocument,
            color: "medical",
            bgGradient: "from-medical-500 to-medical-600",
        }
    ]

    return (
        <div className='bg-gradient-to-br from-blue-50 via-white to-blue-50'>
            <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-24'>
                <div className='flex items-center justify-center flex-col gap-4'>
                    <Badge icon={"⚡"} text={"Simple Process"} />
                    <h2 className="text-4xl font-bold text-medical-900">
                        How It Works
                    </h2>
                </div>

                <p className="text-lg text-medical-700 leading-relaxed text-center mx-auto mt-4 max-w-3xl">
                    From village to specialist in 5 simple steps. See how our telemedicine platform connects patients with doctors in real-time
                </p>

                <div className='mt-20 flex sm:flex-row sm:flex-wrap flex-nowrap flex-col gap-12 justify-center'>
                    {workingSteps.map((item, index) => (
                        <div key={index} className='border border-medical-200 rounded-xl relative sm:w-2/5 w-full bg-white/60 hover:border-medical-400 hover:shadow-lg shadow-medical-100 transition-all duration-200 ease-in-out group overflow-hidden'>
                            <span className='bg-medical-100 text-medical-400 rounded-xl rounded-br-[3rem] p-[22px] w-fit text-3xl font-bold absolute -left-1 -top-2'>{item.step}</span>
                            <div className='py-14 px-6 flex flex-col items-center justify-center'>
                                <span className={`w-20 h-20 mx-auto bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                                    <item.icon className='text-3xl text-white' />
                                </span>
                                <h3 className='text-3xl font-semibold text-medical-900 mt-6'>{item.title}</h3>
                                <p className='text-medical-700 text-md max-w-xl pt-3 text-center'>{item.desc}</p>
                            </div>

                            {/* Animated indicator */}
                            <div className="mt-6 h-1 bg-medical-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${item.bgGradient} rounded-full transform transition-transform duration-1000 group-hover:translate-x-0 -translate-x-full`}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Process
