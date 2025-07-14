import React from 'react'

const Badge = ({icon, text}) => {
    return (
        <div className='bg-medical-100 text-medical-700 border border-medical-300 text-sm px-4 py-2 w-fit rounded-3xl font-medium'>
            {icon} {text}
        </div>
    )
}

export default Badge
