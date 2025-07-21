import Report from '@/UI/Report';
import React, { useEffect, useRef, useState } from 'react'
import { LuFileText, LuLoader } from 'react-icons/lu';
import { MdOutlineLibraryAddCheck } from "react-icons/md";

const Reports = ({ calls, loading, error, showReportPreview, reportContent, handleGenerateReport, handleDownloadReport, handlePrintReport, selectedCall, setShowReportPreview, filter, setFilter }) => {

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { label: 'All Calls', value: 'all' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Referred: Yes', value: 'referred' },
        { label: 'Referred: No', value: 'non-referred' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tableHeader = ["Patient", "Age", "Sex", "Date & Time", "Referred", "Operator", "Action"]

    console.log("loading: ", loading);
    console.log("calls", calls);

    return (
        <div className='w-full h-full'>
            <div className="flex flex-col gap-1 py-7 border-b border-medical-200 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-medical-900">Reports</h1>
                <p className='text-medical-600 font-medium'>View all completed consultations data</p>
            </div>

            <div className='h-max py-10'>
                <div className='md:px-6 px-2'>

                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative">
                            {error}
                        </div>
                    )}

                    <div className='flex items-center gap-3'>
                        <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                            <MdOutlineLibraryAddCheck className='text-xl text-medical-700' />
                        </span>
                        <p className='text-xl font-medium text-medical-800'>All Completed Consultations</p>
                    </div>

                    {/* dropdown */}
                    <div className="relative w-64 mt-12" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full px-4 py-2 border-2 border-medical-200 text-medical-900 bg-white rounded-xl text-left cursor-pointer focus:outline-none"
                        >
                            {options.find((opt) => opt.value === filter)?.label || 'Select option'}
                            <span className="float-right">&#9662;</span>
                        </button>

                        {isOpen && (
                            <ul className="absolute z-50 mt-2 w-full bg-white border border-medical-200 rounded-xl shadow-md max-h-60">
                                {options.map((option) => (
                                    <li
                                        key={option.value}
                                        onClick={() => {
                                            setFilter(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`px-4 first:rounded-t-xl last:rounded-b-xl py-2 hover:bg-emerald-100 cursor-pointer ${filter === option.value ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 font-semibold text-medical-700' : 'text-medical-600'
                                            }`}
                                    >
                                        {option.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className='w-full rounded-xl bg-white mt-4 h-fit'>
                        {calls.length === 0 ? (
                            <div className="bg-white border-2 border-medical-200 rounded-xl p-6 text-center text-medical-700 font-medium">
                                No {filter} calls found
                            </div>
                        ) : (
                            <>
                                <div className="bg-white shadow rounded-lg overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className='w-full rounded-xl bg-gradient-to-r from-medical-100 to-emerald-100'>
                                            <tr>
                                                {tableHeader.map((item, index) => (
                                                    <th key={index} className="py-2 px-4 border border-medical-300 text-left border-r last:border-r-0 font-medium text-medical-900">
                                                        {item}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className='w-full'>
                                            {loading ? (
                                                <span className='flex items-center justify-center p-4 w-full'>
                                                    <LuLoader className='animate-spin duration-1000 w-5 h-5 flex items-center justify-center' />
                                                </span>
                                            ) : (
                                                <>
                                                    {calls?.map((call) => (
                                                        <tr key={call._id}>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {call?.patient?.name}
                                                            </td>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {call?.patient?.age}
                                                            </td>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {call?.patient?.sex === "male" && "M" || call?.patient?.sex === "female" && "F" || call?.patient?.sex}
                                                            </td>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {new Date(call?.startTime).toLocaleString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit',
                                                                    hour12: true,
                                                                })}
                                                            </td>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {call?.referred ? 'Yes' : 'No'}
                                                            </td>
                                                            <td className=" px-4 border-b border-medical-100 border-r">
                                                                {call?.operator?.name}
                                                            </td>
                                                            <td className="py-4 pl-4 border-b border-medical-100">
                                                                <LuFileText className='text-medical-500 w-5 h-5 cursor-pointer hover:scale-105 transition-transform' onClick={() => handleGenerateReport(call)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}

                                        </tbody>
                                    </table>

                                    <Report showReportPreview={showReportPreview} setShowReportPreview={setShowReportPreview} reportContent={reportContent} handlePrintReport={handlePrintReport} handleDownloadReport={handleDownloadReport} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports;
