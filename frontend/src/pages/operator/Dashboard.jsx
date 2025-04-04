import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import socket from '../../utils/socket';
import VideoCall from '../call/VideoCall';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    age: '',
    sex: 'male',
    height: '',
    weight: '',
    oxygenLevel: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    symptoms: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes in seconds
  const timerRef = useRef(null);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients/operator/patients');
      setPatients(response.data);
    } catch (error) {
      setError('Error fetching patients');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create patient record
      const patientResponse = await axios.post('/patients', {
        ...formData,
        bloodPressure: {
          systolic: formData.bloodPressureSystolic,
          diastolic: formData.bloodPressureDiastolic,
        }
      });

      // Create call
      const callResponse = await axios.post('/calls', {
        patientId: patientResponse.data._id,
      });

      console.log('Call API response:', callResponse.data);
      const { _id } = await callResponse.data;

      // Emit socket event for new call
      socket.emit('new-call', { callId: _id });

      // Navigate to call page
      navigate(`/call/${_id}`);

      // Reset form
      setFormData({
        name: '',
        phoneNumber: '',
        age: '',
        sex: 'male',
        height: '',
        weight: '',
        oxygenLevel: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        symptoms: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the call');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">New Patient Consultation</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Patient Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                Sex
              </label>
              <select
                name="sex"
                id="sex"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.sex}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                id="height"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.height}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="oxygenLevel" className="block text-sm font-medium text-gray-700">
                Oxygen Level (SpO2)
              </label>
              <input
                type="number"
                name="oxygenLevel"
                id="oxygenLevel"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.oxygenLevel}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bloodPressureSystolic" className="block text-sm font-medium text-gray-700">
                  BP Systolic
                </label>
                <input
                  type="number"
                  name="bloodPressureSystolic"
                  id="bloodPressureSystolic"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bloodPressureDiastolic" className="block text-sm font-medium text-gray-700">
                  BP Diastolic
                </label>
                <input
                  type="number"
                  name="bloodPressureDiastolic"
                  id="bloodPressureDiastolic"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              id="symptoms"
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.symptoms}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Call...' : 'Create Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 