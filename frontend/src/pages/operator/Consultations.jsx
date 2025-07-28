import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket, disconnectSocket } from '../../utils/socket';
import { createCall } from '../../services/callService';
import { LuUser, LuPhone, LuCalendar, LuHeart, LuRuler, LuWeight, LuThermometer, LuFileText, LuInfo, LuVideo, LuCircleArrowRight } from "react-icons/lu";
import { RiSpeedUpLine } from "react-icons/ri";
import { GoPulse } from "react-icons/go";

const Consultations = () => {
    const [patientData, setPatientData] = useState({
        name: '',
        phoneNumber: '',
        age: '',
        sex: 'male',
        symptoms: '',
        height: '',
        weight: '',
        oxygenLevel: '',
        temperature: '',
        pulse: '',
        bloodPressure: {
            systolic: '',
            diastolic: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('userRole', 'operator');
        console.log('Socket connected in operator dashboard');

        const token = localStorage.getItem('token');
        if (token) {
            connectSocket(token);
        }

        return () => {
            disconnectSocket();
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('bloodPressure.')) {
            const bpField = name.split('.')[1];
            setPatientData(prev => ({
                ...prev,
                bloodPressure: {
                    ...prev.bloodPressure,
                    [bpField]: value
                }
            }));
        } else {
            setPatientData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create the call with all required fields
            const call = await createCall({
                name: patientData.name,
                phoneNumber: patientData.phoneNumber,
                age: parseInt(patientData.age),
                sex: patientData.sex,
                height: parseFloat(patientData.height),
                weight: parseFloat(patientData.weight),
                oxygenLevel: parseFloat(patientData.oxygenLevel),
                temperature: parseFloat(patientData.temperature),
                pulse: parseFloat(patientData.pulse),
                bloodPressure: {
                    systolic: parseInt(patientData.bloodPressure.systolic),
                    diastolic: parseInt(patientData.bloodPressure.diastolic)
                },
                symptoms: patientData.symptoms
            });

            // Emit socket event for new call
            const socket = getSocket();
            if (socket?.connected) {
                socket.emit('new-call', { callId: call._id });
            }

            // Navigate to call page
            navigate(`/call/${call._id}`);
        } catch (err) {
            console.error('Error creating call:', err);
            setError(err.response?.data?.message || 'Failed to create call. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    console.log(patientData)

    return (
        <div className="w-full mx-auto h-full">
            <div className="flex flex-col gap-1 py-7 border-b border-medical-200 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-medical-900">Patient Consultation Form</h1>
                <p className='text-medical-600 font-medium'>Please fill in the patient details to start the consultation</p>
            </div>

            <div className="px-4 sm:px-6 xl:px-36 py-6 bg-medical-50">
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Patient info section */}
                    <div className='border border-medical-200 p-6 bg-white rounded-lg shadow-lg'>
                        <h1 className='flex items-center gap-2 text-xl font-medium text-medical-900'>
                            <LuUser className='text-medical-600' />
                            Patient Information
                        </h1>

                        <div className='mt-6 mb-2 grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <div className='flex flex-col gap-2 relative'>
                                <LuUser className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Patient Name</label>
                                <input
                                    name="name"
                                    value={patientData.name}
                                    onChange={handleInputChange}
                                    required
                                    type="text"
                                    placeholder="Enter patient's full name"
                                    className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <LuPhone className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Phone Number</label>
                                <input required
                                    type="number"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={patientData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                    className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <LuCalendar className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Age</label>
                                <input
                                    required
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={patientData.age}
                                    onChange={handleInputChange} placeholder="Enter age" className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <label className="text-sm font-medium text-medical-800">Sex</label>
                                <select
                                    id="sex"
                                    name="sex"
                                    value={patientData.sex}
                                    onChange={handleInputChange}
                                    required
                                    className="pl-4 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2"
                                >
                                    {/* <option className='text-gray-500' value="">Select...</option> */}
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Vital signs section */}
                    <div className='border border-medical-200 p-6 bg-white rounded-lg shadow-lg'>
                        <h1 className='flex items-center gap-2 text-xl font-medium text-medical-900'>
                            <LuHeart className='text-medical-600' />
                            Vital Signs
                        </h1>

                        <div className='mt-6 mb-2 grid grid-cols-1 lg:grid-cols-3 gap-6'>
                            <div className='flex flex-col gap-2 relative'>
                                <LuRuler className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Height (cm)</label>
                                <input
                                    required
                                    type="number"
                                    id="height"
                                    name="height"
                                    value={patientData.height}
                                    onChange={handleInputChange}
                                    placeholder="Enter patient's height"
                                    className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <LuWeight className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Weight (kg)</label>
                                <input
                                    required
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={patientData.weight}
                                    onChange={handleInputChange} placeholder="Enter patient's weight" className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <LuThermometer className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Temperature (°C)</label>
                                <input
                                    required
                                    type="number"
                                    id="temperature"
                                    name="temperature"
                                    value={patientData.temperature}
                                    onChange={handleInputChange} placeholder="Temperature reading" className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <RiSpeedUpLine className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Oxygen Level (%)</label>
                                <input
                                    required
                                    type="number"
                                    id="oxygenLevel"
                                    name="oxygenLevel"
                                    value={patientData.oxygenLevel}
                                    onChange={handleInputChange} placeholder="Patient's oxygen level" className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative'>
                                <GoPulse className="absolute left-3 top-[60%] transform text-medical-400 w-4 h-4" />
                                <label className="text-sm font-medium text-medical-800">Pulse (BPM)</label>
                                <input
                                    required
                                    type="number"
                                    id="pulse"
                                    name="pulse"
                                    value={patientData.pulse}
                                    onChange={handleInputChange} placeholder="Enter patient's pulse" className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2" />
                            </div>
                            <div className='flex flex-col gap-2 relative w-full'>
                                <label className="text-sm font-medium text-medical-800">Blood Pressure (mmHg)</label>
                                <div className='flex items-center gap-2 w-full'>
                                    <input
                                        required
                                        type="number"
                                        name="bloodPressure.systolic"
                                        value={patientData.bloodPressure.systolic}
                                        onChange={handleInputChange} placeholder="Systolic" className="pl-4 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full" />
                                    <span className='text-medical-600 font-medium'>/</span>
                                    <input
                                        required
                                        type="number"
                                        name="bloodPressure.diastolic"
                                        value={patientData.bloodPressure.diastolic}
                                        onChange={handleInputChange} placeholder="Diastolic" className="pl-4 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms & Notes */}
                    <div className='border border-medical-200 p-6 bg-white rounded-lg shadow-lg'>
                        <h1 className='flex items-center gap-2 text-xl font-medium text-medical-900'>
                            <LuFileText className='text-medical-600' />
                            Symptoms & Notes
                        </h1>

                        <div className='mt-6 mb-2'>
                            <label className='text-sm font-medium text-medical-800'>Describe symptoms, concerns, and relevant medical history</label>
                            <textarea
                                id="symptoms"
                                name="symptoms"
                                value={patientData.symptoms}
                                onChange={handleInputChange}
                                rows={6}
                                required
                                placeholder="Please describe the patient's symptoms, any pain levels, duration of symptoms, previous treatments, allergies, or other relevant medical information..."
                                className='pl-4 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full mt-2'
                            />
                            <p className='text-sm text-medical-700 flex items-center gap-1'><LuInfo /> Detailed symptom information helps doctors provide better consultation</p>
                        </div>
                    </div>

                    <div className='flex items-center justify-center w-full'>
                        <button type='submit' disabled={loading} className='w-fit flex items-center gap-4 bg-gradient-to-r from-medical-600 to-emerald-600 hover:from-medical-700 hover:to-emerald-700 text-white px-12 py-4 text-xl rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group'>
                            {loading ?
                                'Creating Call...'
                                :
                                (
                                    <>
                                        <LuVideo />
                                        Start Video Consultation
                                        <LuCircleArrowRight className='group-hover:translate-x-1 transition-transform' />
                                    </>
                                )}

                        </button>
                    </div>


                    {/* <div className='grid grid-cols-2 gap-6'>
                    <button type="submit" disabled={loading} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2'>
                        {loading ? 'Creating Call...' : 'Start Call'}
                    </button> */}
                </form>
            </div >
        </div >
    )
}

export default Consultations
