import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket, disconnectSocket } from '../../utils/socket';
import { createCall } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [patientData, setPatientData] = useState({
    name: '',
    phoneNumber: '',
    age: '',
    sex: '',
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
  const { auth, logout } = useAuth();

  useEffect(() => {
    // Force-set the userRole to ensure WebRTC works correctly
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className='grid grid-cols-2 gap-6'>
            <div className='flex flex-col gap-3'>
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className='text-sm font-medium text-gray-700'>Patient Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={patientData.name}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="phoneNumber" className='text-sm font-medium text-gray-700'>Phone Number</label>
                <input
                  type="number"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={patientData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="age" className='text-sm font-medium text-gray-700'>Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={patientData.age}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="sex" className='text-sm font-medium text-gray-700'>Sex</label>
                <select
                  id="sex"
                  name="sex"
                  value={patientData.sex}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="temperature" className='text-sm font-medium text-gray-700'>Temperature (°C)</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={patientData.temperature}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <div className="flex flex-col gap-1">
                <label htmlFor="height" className='text-sm font-medium text-gray-700'>Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={patientData.height}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="weight" className='text-sm font-medium text-gray-700'>Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={patientData.weight}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="oxygenLevel" className='text-sm font-medium text-gray-700'>Oxygen Level (%)</label>
                <input
                  type="number"
                  id="oxygenLevel"
                  name="oxygenLevel"
                  value={patientData.oxygenLevel}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="pulse" className='text-sm font-medium text-gray-700'>Pulse (BPM)</label>
                <input
                  type="number"
                  id="pulse"
                  name="pulse"
                  value={patientData.pulse}
                  onChange={handleInputChange}
                  required
                  className='border border-gray-300 outline-blue-500 rounded-md p-2'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className='text-sm font-medium text-gray-700'>Blood Pressure (mmHg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="bloodPressure.systolic"
                    value={patientData.bloodPressure.systolic}
                    onChange={handleInputChange}
                    placeholder="Systolic"
                    required
                    className='border border-gray-300 outline-blue-500 rounded-md p-2 flex-grow'
                  />
                  <span>/</span>
                  <input
                    type="number"
                    name="bloodPressure.diastolic"
                    value={patientData.bloodPressure.diastolic}
                    onChange={handleInputChange}
                    placeholder="Diastolic"
                    required
                    className='border border-gray-300 outline-blue-500 rounded-md p-2 flex-grow'
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 my-4">
            <label htmlFor="symptoms" className='text-sm font-medium text-gray-700'>Symptoms</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={patientData.symptoms}
              onChange={handleInputChange}
              required
              className='border border-gray-300 outline-blue-500 rounded-md p-2'
            />
          </div>

          <button type="submit" disabled={loading} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2'>
            {loading ? 'Creating Call...' : 'Start Call'}
          </button>
        </form>
      </div >
    </div >
  );
};

export default Dashboard; 