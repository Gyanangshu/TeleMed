import React from 'react'

const DashboardBoxes = ({number, text}) => {
  return (
    <div className='bg-white rounded-xl border border-medical-200 py-5 px-6 flex flex-col gap-2 flex-1 w-full h-full'>
      <p className='text-4xl font-bold text-medical-900'>{number}</p>
      <p className='text-medical-600 font-medium'>{text}</p>
    </div>
  )
}

export default DashboardBoxes
