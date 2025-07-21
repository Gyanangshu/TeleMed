import React from 'react'
import { LuMail, LuPhone, LuMapPin, LuHospital } from "react-icons/lu";

const Operators = ({ operators }) => {

  console.log(operators)

  return (
    <div className='w-full h-full'>

      <div className="flex items-center justify-between flex-wrap gap-6 py-7 border-b border-medical-200 sm:px-6 lg:px-8 px-2">
        <div className='flex flex-col gap-1 '>
          <h1 className="text-3xl font-bold text-medical-900">Operators</h1>
          <p className='text-medical-600 font-medium'>View complete list of operators</p>
        </div>
      </div>

      <div className='h-max py-10'>
        <div className='md:px-6 px-2 grid grid-cols-2 gap-6'>
          {operators.map((item, index) => (
            <div key={index} className='bg-gradient-to-r from-medical-600 to-emerald-600 rounded-xl px-4 pt-4 pb-2 mb-2 text-white w-full'>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mb-1 text-xl">
                  {item?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{`${item?.name}`}</p>
                  <p className="text-white/80">
                    {item?.role}</p>
                </div>
              </div>

              <div className='my-6 p-4 grid grid-cols-2 gap-y-4'>
                <div className='flex items-center gap-2'>
                  <LuMail className='text-white w-5 h-5' />
                  <p className='pb-1 text-lg'>{item.email}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <LuPhone className='text-white w-5 h-5' />
                  <p className='pb-1 text-lg'>{item.phone}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <LuHospital className='text-white w-5 h-5' />
                  <p className='pb-1 text-lg'>{item.hospitalName}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <LuMapPin className='text-white w-5 h-5' />
                  <p className='pb-1 text-lg'>{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Operators
