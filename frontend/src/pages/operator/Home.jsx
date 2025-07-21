import React from 'react'

const Home = () => {
    const userName = localStorage.getItem('userName');

    return (
        <div className='w-full mx-auto h-full'>
            <div className="flex flex-col gap-1 py-7 border-b border-medical-200 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-medical-900">Welcome, {userName ? userName : 'Operator'}</h1>
                <p className='text-medical-600 font-medium'>Create new video call appointments</p>
            </div>
        </div>
    )
}

export default Home
