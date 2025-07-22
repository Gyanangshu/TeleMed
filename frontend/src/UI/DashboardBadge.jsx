import React from 'react'

const DashboardBadge = ({text, color}) => {
    return (
        <div className={`flex items-center gap-2 bg-${color}-100 py-[2px] px-4 rounded-2xl border border-${color}-300 w-fit`}>
            <span className={`p-[4px] bg-${color}-700 h-fit w-fit rounded-full`}></span>
            <p className={`text-sm font-medium pb-1 text-${color}-700`}>{text}</p>
        </div>
    )
}

export default DashboardBadge
