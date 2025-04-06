import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket, isSocketConnected } from '../../utils/socket';
import { getCalls } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const pollingIntervalRef = useRef(null);

  const fetchCalls = async () => {
    try {
      console.log('Fetching pending calls...');
      const data = await getCalls();
      setCalls(data);
      console.log(`Fetched ${data.length} pending calls`);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of calls
  useEffect(() => {
    fetchCalls();
  }, []);

  // Set up polling as a fallback when socket isn't connected
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      console.log('Starting polling for calls (fallback mechanism)...');
      pollingIntervalRef.current = setInterval(() => {
        console.log('Polling for pending calls...');
        fetchCalls();
      }, 15000); // Poll every 15 seconds
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        console.log('Stopping polling, socket connected');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    // Start polling if socket is not connected
    if (!socketConnected) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [socketConnected]);

  // Socket connection and event handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Connecting socket for real-time call updates...');
      const socket = connectSocket(token);
      
      const setupSocketListeners = () => {
        console.log('Setting up socket listeners for new calls...');
        setSocketConnected(true);
        
        // Listen for doctor room join confirmation
        socket.on('doctor-room-joined', (data) => {
          console.log('Received doctor room join confirmation:', data);
          console.log('Now listening for new pending calls...');
        });
        
        socket.on('new-pending-call', (newCall) => {
          console.log('New pending call received via socket:', newCall);
          // Make sure we have the complete call object with patient data
          if (newCall && newCall._id) {
            console.log('Call data is valid, refreshing calls list...');
            fetchCalls();
          } else {
            console.error('Received invalid call data:', newCall);
          }
        });
        
        // Listen for global updates as a fallback
        socket.on('global-pending-call-update', (data) => {
          console.log('Received global call update:', data);
          if (data.action === 'new') {
            console.log('New call created, refreshing call list...');
            fetchCalls();
          }
        });
      };
      
      // Add listeners once socket is confirmed connected
      if (socket && socket.connected) {
        console.log('Socket already connected, setting up listeners...');
        setupSocketListeners();
      } else {
        console.log('Socket connecting, will setup listeners on connect event...');
        // Wait for connection event
        socket.on('connect', setupSocketListeners);
        
        socket.on('disconnect', () => {
          console.log('Socket disconnected, falling back to polling');
          setSocketConnected(false);
        });
        
        socket.on('connect_error', (error) => {
          console.log('Socket connection error, falling back to polling:', error.message);
          setSocketConnected(false);
        });
      }
    }

    return () => {
      console.log('Cleaning up socket event listeners...');
      const socket = getSocket();
      if (socket) {
        socket.off('new-pending-call');
        socket.off('doctor-room-joined');
        socket.off('global-pending-call-update');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
      disconnectSocket();
    };
  }, []);

  // Manual refresh button handler
  const handleRefresh = () => {
    fetchCalls();
  };

  const handleJoinCall = (callId) => {
    navigate(`/call/${callId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
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
        </div>
        
        {/* Connection status indicator */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${socketConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <span className={`h-2 w-2 rounded-full mr-1.5 ${socketConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
            {socketConnected ? 'Real-time updates active' : 'Using periodic updates'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calls.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No pending calls available
            </div>
          ) : (
            calls.map((call) => (
              <div key={call._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Patient: {call.patient.name}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Age: {call.patient.age}</p>
                    <p>Sex: {call.patient.sex}</p>
                    <p>Status: {call.status}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleJoinCall(call._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 