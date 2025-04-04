import { useState, useEffect } from 'react';
import axios from '../../utils/axios';

export default function AdminDashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, ongoing, completed

  useEffect(() => {
    fetchCalls();
  }, [filter]);

  const fetchCalls = async () => {
    try {
      const response = await axios.get(`/calls?status=${filter}`);
      setCalls(response.data);
    } catch (err) {
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Call History</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Calls</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-6">
          {calls.length === 0 ? (
            <div className="text-center text-gray-500">
              No calls found
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {calls.map((call) => (
                  <li key={call._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {call.patient.name}
                            </p>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(call.status)}`}>
                              {call.status}
                            </span>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Operator: {call.operator.name}</span>
                              {call.doctor && (
                                <span className="ml-4">Doctor: {call.doctor.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>Patient Age: {call.patient.age} | Sex: {call.patient.sex}</p>
                            <p>Start Time: {new Date(call.startTime).toLocaleString()}</p>
                            {call.endTime && (
                              <p>End Time: {new Date(call.endTime).toLocaleString()}</p>
                            )}
                          </div>
                          {call.consultationCompleted && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Consultation Completed: {call.consultationCompleted ? 'Yes' : 'No'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Referred: {call.referred ? 'Yes' : 'No'}
                              </p>
                            </div>
                          )}
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