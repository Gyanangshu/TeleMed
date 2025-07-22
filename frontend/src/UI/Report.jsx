import React from 'react'
import { LuFileText } from 'react-icons/lu'

const Report = ({ showReportPreview, setShowReportPreview, reportContent, handlePrintReport, handleDownloadReport }) => {
    return (
        <div>
            {showReportPreview && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[86vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className='flex items-center gap-2'>
                                    <span className='rounded-full bg-boxBg p-3 h-fit w-fit'>
                                        <LuFileText className='text-medical-600 w-4 h-4 cursor-pointer hover:scale-105 transition-transform' />
                                    </span>
                                    <h3 className="text-2xl text-medical-900 font-semibold">Consultation Report Preview</h3>
                                </div>

                                <button
                                    onClick={() => setShowReportPreview(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className='mt-6'>
                                <iframe
                                    src={reportContent.output('datauristring')}
                                    className="w-full h-[60vh] border-0 rounded-xl"
                                    title="PDF Preview"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={handlePrintReport}
                                    className="bg-medical-600 text-white px-4 py-2 rounded-md hover:bg-medical-700 transition-colors"
                                >
                                    Print Report
                                </button>
                                <button
                                    onClick={handleDownloadReport}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Report
