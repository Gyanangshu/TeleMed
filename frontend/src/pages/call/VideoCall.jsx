import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '../../utils/socket';
import { setupWebRTC } from '../../utils/webrtc';
import { getCallById } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const VideoCall = () => {
  const { callId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [webRTCInitialized, setWebRTCInitialized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Socket connection setup
  useEffect(() => {
    let socket;
    const setupSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('Authentication required');
        return;
      }

      try {
        console.log('Connecting socket with token...');
        socket = connectSocket(token);
        
        socket.on('connect', () => {
          console.log('Socket connected in video call');
          setSocketConnected(true);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected in video call');
          setSocketConnected(false);
          setWebRTCInitialized(false);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error in video call:', error);
          setError('Failed to connect to server');
          setSocketConnected(false);
          setWebRTCInitialized(false);
        });
      } catch (err) {
        console.error('Error setting up socket:', err);
        setError('Failed to setup connection');
      }
    };

    setupSocket();

    return () => {
      console.log('Cleaning up video call...');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      disconnectSocket();
    };
  }, []);

  // Fetch call details
  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        console.log('Fetching call details for:', callId);
        const callData = await getCallById(callId);
        console.log('Call details received:', callData);
        if (!callData) {
          throw new Error('Call not found');
        }
        setCall(callData);
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch call details');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchCallDetails();
    } else {
      console.error('No callId provided');
      setError('Invalid call ID');
      navigate('/dashboard');
    }
  }, [callId, navigate]);

  // WebRTC setup
  useEffect(() => {
    if (!call || !user || !socketConnected || webRTCInitialized) {
      console.log('Waiting for prerequisites or WebRTC already initialized:', {
        hasCall: !!call,
        hasUser: !!user,
        isSocketConnected: socketConnected,
        isWebRTCInitialized: webRTCInitialized
      });
      return;
    }

    console.log('All prerequisites met, setting up WebRTC...');
    console.log('Call:', call);
    console.log('User:', user);
    console.log('Socket connected:', socketConnected);

    let cleanup;
    try {
      cleanup = setupWebRTC(
        call,
        user,
        localVideoRef,
        remoteVideoRef,
        peerConnectionRef,
        (error) => {
          console.error('WebRTC error:', error);
          setError('Failed to establish video connection');
          setWebRTCInitialized(false);
        }
      );
      setWebRTCInitialized(true);
      console.log('WebRTC setup completed successfully');
    } catch (err) {
      console.error('Error in WebRTC setup:', err);
      setError('Failed to setup video call');
      setWebRTCInitialized(false);
    }

    return () => {
      if (cleanup) {
        console.log('Cleaning up WebRTC...');
        cleanup();
        setWebRTCInitialized(false);
      }
    };
  }, [call, user, socketConnected]);

  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/80 text-red-100 px-6 py-4 rounded-lg text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !socketConnected) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/80 text-white px-6 py-4 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>{isLoading ? 'Loading call details...' : 'Connecting to server...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center relative">
      <div className="w-full h-full relative">
        {/* Remote Video */}
        <div className="w-full h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Local Video */}
        <div className="absolute bottom-5 right-5 w-60 h-[180px] rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Connection Status */}
        {!webRTCInitialized && (
          <div className="absolute top-5 left-5 bg-yellow-600/80 text-white px-4 py-2 rounded">
            Establishing video connection...
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall; 