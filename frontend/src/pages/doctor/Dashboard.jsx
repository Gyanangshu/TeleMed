import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import socket from '../../utils/socket';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCalls();
    
    // Listen for new calls
    socket.on('new-call', handleNewCall);
    
    return () => {
      socket.off('new-call', handleNewCall);
    };
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get('/calls/pending');
      setCalls(response.data);
    } catch (err) {
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCall = (data) => {
    setCalls(prevCalls => [data.call, ...prevCalls]);
  };

  const handleJoinCall = async (callId) => {
    try {
      await axios.post(`/calls/${callId}/join`);
      navigate(`/call/${callId}`);
    } catch (err) {
      setError('Failed to join call');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Pending Consultations</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-6">
          {calls.length === 0 ? (
            <div className="text-center text-gray-500">
              No pending consultations
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {calls.map((call) => (
                  <li key={call._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {call.patient.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Age: {call.patient.age} | Sex: {call.patient.sex}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Symptoms: {call.patient.symptoms}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleJoinCall(call._id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Join Call
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 