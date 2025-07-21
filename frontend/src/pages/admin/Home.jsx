import DashboardBoxes from '@/UI/DashboardBoxes';
import { LuVideo, LuHeart, LuMapPin, LuFileText } from "react-icons/lu";
import { MdOutlineMoreTime } from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import Report from '@/UI/Report';

const Home = ({ calls, loading, error, showReportPreview, reportContent, handleGenerateReport, handleDownloadReport, handlePrintReport, selectedCall, setShowReportPreview }) => {

    // console.log("selectedCall: ", selectedCall);
    // console.log("showReportPreview: ", showReportPreview);
    // console.log("reportContent: ", reportContent);

    const userName = localStorage.getItem('userName');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    };

    const todaysDate = new Date();

    // get data for today's date 
    const todaysData = calls.filter(item => {
        const date = new Date(item.createdAt);
        return (
            date.getFullYear() === todaysDate.getFullYear() &&
            date.getMonth() === todaysDate.getMonth() &&
            date.getDate() === todaysDate.getDate()
        );
    })

    const weekday = todaysDate?.toLocaleDateString('en-GB', { weekday: 'long' });
    const day = todaysDate?.getDate();
    const month = todaysDate?.toLocaleDateString('en-GB', { month: 'long' });
    const year = todaysDate?.getFullYear();

    const finalDate = `${weekday} ${day} ${month}, ${year}`;
    // console.log(finalDate)

    // console.log("todaysData", todaysData)

    // box data
    const referCount = todaysData.reduce((acc, ele) => {
        if (ele.referred) {
            acc += 1
        }
        return acc
    }, 0);

    const completedConsultations = todaysData.reduce((acc, ele) => {
        if (ele.status === "completed") {
            acc += 1
        }
        return acc
    }, 0);

    const consultationOngoing = todaysData.reduce((acc, ele) => {
        if (ele.status === "ongoing") {
            acc += 1
        }
        return acc
    }, 0);

    const totalConsultations = completedConsultations + consultationOngoing;

    // console.log("completedConsultations: ", completedConsultations);
    // console.log("consultationOngoing: ", consultationOngoing);
    // console.log("referCount: ", referCount);
    // console.log("calls data: ", calls);

    const formatTimeWithAmPm = (createdAt) => {
        const date = new Date(createdAt);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    return (
        <div className="w-full mx-auto h-full">

            <div className="flex flex-col gap-1 py-7 border-b border-medical-200 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-medical-900">Welcome, {userName ? userName : 'Admin'}</h1>
                <p className='text-medical-600 font-medium'>{finalDate}</p>
            </div>

            <div className=' py-6 h-max overflow-y-auto'>
                <div className="md:px-6 px-2 ">
                    {error && (
                        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    <div className='flex flex-wrap items-center gap-4 w-full h-full'>
                        <DashboardBoxes text={"Total Consultations"} number={totalConsultations} />
                        <DashboardBoxes text={"Consultations Completed"} number={completedConsultations} />
                        <DashboardBoxes text={"Ongoing Consultations"} number={consultationOngoing} />
                        <DashboardBoxes text={"Patients Referred"} number={referCount} />
                    </div>

                    <div className='flex gap-4 h-full'>
                        {/* completed consultations */}
                        <div className='xl:w-1/2 w-full rounded-lg border border-medical-200 px-6 py-10 bg-white mt-6 h-fit'>
                            <div className='flex items-center gap-3'>
                                <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                                    <LuVideo className='text-2xl text-medical-700' />
                                </span>
                                <p className='text-xl font-medium text-medical-800'>Consultations Completed</p>
                            </div>

                            {todaysData?.filter(item => item.status === 'completed').length === 0 ? (
                                <div className='mt-6 text-medical-700 font-medium'>No completed consultations today</div>
                            ) : (
                                todaysData
                                    .filter(item => item.status === 'completed')
                                    .map((item, index) => (
                                        <div key={index} className='mt-6 border border-medical-100 rounded-xl p-5 bg-medical-50'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-3'>
                                                    <span className='w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-medical-600 to-emerald-600'>
                                                        <LuHeart className='text-white w-6 h-6' />
                                                    </span>

                                                    <div>
                                                        <p className='font-medium text-lg'>{item.patient.name}</p>
                                                        <p className='text-sm text-medical-700'>with Dr. {item.doctor.name}</p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-2'>
                                                    <div className='flex items-center gap-2 bg-green-100 py-[2px] px-4 rounded-2xl border border-green-300'>
                                                        <span className='p-[4px] bg-green-400 h-fit w-fit rounded-full'></span>
                                                        <p className='text-sm font-medium pb-1 text-green-700'>completed</p>
                                                    </div>
                                                    <span className='rounded-full p-2 bg-white border border-medical-100 cursor-pointer hover:scale-105 transition-transform' onClick={() => handleGenerateReport(item)}>
                                                        <LuFileText className='text-medical-500 w-4 h-4' />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='mt-6 flex items-center justify-between'>
                                                <div className='flex items-center gap-2 w-1/2'>
                                                    <LuMapPin className='text-medical-500 w-5 h-5' />
                                                    <p className='text-medical-700'>{item?.operator?.location ? item?.operator?.location : "Unknown"}</p>
                                                </div>

                                                <div className='flex items-center gap-2 w-1/2'>
                                                    <TbCalendarTime className='text-medical-500 w-5 h-5' />
                                                    <p className='text-medical-700'>{formatTimeWithAmPm(item.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* on-going consultations */}
                        <div className='xl:w-1/2 w-full rounded-lg border border-medical-200 px-6 py-10 bg-white mt-6 h-fit'>
                            <div className='flex items-center gap-3'>
                                <span className='rounded-xl bg-boxBg p-3 h-fit w-fit'>
                                    <MdOutlineMoreTime className='text-2xl text-medical-700' />
                                </span>
                                <p className='text-xl font-medium text-medical-800'>Active Consultations</p>
                            </div>

                            {todaysData?.filter(item => item.status === 'ongoing').length === 0 ? (
                                <div className='mt-6 text-medical-700 font-medium'>No active consultations</div>
                            ) : (
                                todaysData
                                    .filter(item => item.status === 'ongoing')
                                    .map((item, index) => (
                                        <div key={index} className='mt-6 border border-medical-100 rounded-xl p-5 bg-medical-50'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-3'>
                                                    <span className='w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-medical-600 to-emerald-600'>
                                                        <LuHeart className='text-white w-6 h-6' />
                                                    </span>

                                                    <div>
                                                        <p className='font-medium text-lg'>{item.patient.name}</p>
                                                        <p className='text-sm text-medical-700'>with Dr. {item.doctor.name}</p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-2'>
                                                    <div className='flex items-center gap-2 bg-yellow-100 py-[2px] px-4 rounded-2xl border border-yellow-300'>
                                                        <span className='p-[4px] bg-yellow-400 h-fit w-fit rounded-full'></span>
                                                        <p className='text-sm font-medium pb-1 text-yellow-700'>ongoing</p>
                                                    </div>
                                                    <span className='rounded-full p-2 bg-white border border-medical-100'>
                                                        <LuFileText className='text-medical-500 w-4 h-4' />
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='mt-6 flex items-center justify-between'>
                                                <div className='flex items-center gap-2 w-1/2'>
                                                    <LuMapPin className='text-medical-500 w-5 h-5' />
                                                    <p className='text-medical-700'>{item?.operator?.location}</p>
                                                </div>

                                                <div className='flex items-center gap-2 w-1/2'>
                                                    <TbCalendarTime className='text-medical-500 w-5 h-5' />
                                                    <p className='text-medical-700'>{formatTimeWithAmPm(item.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    <Report showReportPreview={showReportPreview} setShowReportPreview={setShowReportPreview} reportContent={reportContent} handlePrintReport={handlePrintReport} handleDownloadReport={handleDownloadReport} />
                </div>
            </div>

        </div>
    )
}

export default Home
