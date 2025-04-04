import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../../utils/socket';
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
    bloodPressure: {
      systolic: '',
      diastolic: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = connectSocket(token);
      
      // Listen for socket connection events
      socket.on('connect', () => {
        console.log('Socket connected in operator dashboard');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error in operator dashboard:', error);
        setError('Connection error. Please try again.');
      });
    }
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

  return (
    <div className="dashboard">
      <h1>Operator Dashboard</h1>
      <form onSubmit={handleSubmit} className="patient-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">Patient Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={patientData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={patientData.phoneNumber}
            onChange={handleInputChange}
            required
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={patientData.age}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <select
            id="sex"
            name="sex"
            value={patientData.sex}
            onChange={handleInputChange}
            required
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={patientData.height}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={patientData.weight}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="oxygenLevel">Oxygen Level (%)</label>
          <input
            type="number"
            id="oxygenLevel"
            name="oxygenLevel"
            value={patientData.oxygenLevel}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Blood Pressure (mmHg)</label>
          <div className="blood-pressure-inputs">
            <input
              type="number"
              name="bloodPressure.systolic"
              value={patientData.bloodPressure.systolic}
              onChange={handleInputChange}
              placeholder="Systolic"
              required
            />
            <span>/</span>
            <input
              type="number"
              name="bloodPressure.diastolic"
              value={patientData.bloodPressure.diastolic}
              onChange={handleInputChange}
              placeholder="Diastolic"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Symptoms</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={patientData.symptoms}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Call...' : 'Start Call'}
        </button>
      </form>
    </div>
  );
};

export default Dashboard; 