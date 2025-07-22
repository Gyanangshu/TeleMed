import Report from '@/UI/Report';
import React, { useState } from 'react'
import { LuFileText } from 'react-icons/lu';
import { MdOutlineLibraryAddCheck } from 'react-icons/md';
import { generateConsultationReport } from '@/utils/reportGenerator';

const Home = ({ allConsultations }) => {
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const userName = localStorage.getItem('userName');

    const tableHeader = ["Patient", "Age", "Sex", "Date & Time", "Referred", "Action"];

    const handleGenerateReport = (call) => {
        setSelectedCall(call);
        const doc = generateConsultationReport(call, call.patient);
        setReportContent(doc);
        setShowReportPreview(true);
    };

    const handleDownloadReport = () => {
        const doc = reportContent;
        doc.save(`consultation-report-${selectedCall.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePrintReport = () => {
        console.log("reportContent: ", reportContent)
        const doc = reportContent;
        doc.autoPrint();

        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);

        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
            // Optional: clean up the object URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 10000);
        } else {
            alert('Please allow popups for this site to print the report.');
        }
    };


    return (
        <div className='w-full mx-auto h-full'>
            <div className="flex flex-col gap-1 py-7 border-b border-medical-200 px-4 lg:px-8">
                <h1 className="text-3xl font-bold text-medical-900">Welcome, {userName ? userName : 'Operator'}</h1>
                <p className='text-medical-600 font-medium'>View & access all your created calls data</p>
            </div>

            <div className='h-max py-10'>
                <div className='md:px-6 px-4'>
                    <div className='flex items-center gap-3'>
                        <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                            <MdOutlineLibraryAddCheck className='text-xl text-medical-700' />
                        </span>
                        <p className='text-xl font-medium text-medical-800'>All Completed Consultations</p>
                    </div>

                    <div className='w-full rounded-xl bg-white mt-8 h-fit'>

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
                                    {allConsultations.length === 0 ? (
                                        <tr>
                                            <td className=" px-4 py-2 ">No consultations found</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {allConsultations?.map((call) => (
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

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
