import React from 'react'
import Badge from '@/UI/Badge'
import { Monitor, Zap } from 'lucide-react'

const Technology = () => {

    const frontendTech = ["ReactJs", "WebRTC", "Tailwind CSS", "Figma"]
    const backendTech = ["Node.js", "MongoDB", "Docker", "Github Actions"]

    return (
        <div className='px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto py-24' id="tech">
            <div className='flex items-center justify-center flex-col gap-4'>
                <Badge icon={"⚙️"} text={"Technology"} />
                <h2 className="text-4xl font-bold text-medical-900">
                    Built for Scale
                </h2>
            </div>

            <div className='mt-16 flex xl:flex-row flex-col gap-8'>
                {/* frontend */}
                <div className='border border-medical-200 rounded-xl w-full p-8'>
                    <h3 className="text-2xl font-semibold text-medical-900 mb-6 flex items-center">
                        <Monitor className="w-6 h-6 mr-3 text-medical-600" />
                        Frontend Stack
                    </h3>

                    <div className='mt-8 grid md:grid-cols-2 grid-cols-1 gap-x-4 gap-y-5'>
                        {frontendTech.map((item, index) => (
                            <div key={index} className='bg-boxBg w-full flex items-center gap-3 px-5 py-3 rounded-xl'>
                                <span className="p-[5px] rounded-full bg-blue-400 h-1 w-1"></span>
                                <p className='text-medical-700 font-medium'>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Backend */}
                <div className='border border-medical-200 rounded-xl w-full p-8'>
                    <h3 className="text-2xl font-semibold text-medical-900 mb-6 flex items-center">
                        <Zap className="w-6 h-6 mr-3 text-medical-600" />
                        Backend & Infrastructure
                    </h3>

                    <div className='mt-8 grid md:grid-cols-2 grid-cols-1 gap-x-4 gap-y-5'>
                        {backendTech.map((item, index) => (
                            <div key={index} className='bg-boxBg w-full flex items-center gap-3 px-5 py-3 rounded-xl'>
                                <span className="p-[5px] rounded-full bg-emerald-400 h-1 w-1"></span>
                                <p className='text-medical-700 font-medium'>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Technology
