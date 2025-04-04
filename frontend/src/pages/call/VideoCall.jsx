import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '../../utils/socket';
import { setupWebRTC } from '../../utils/webrtc';
import { getCallById } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const VideoCall = () => {
  const { callId } = useParams();
  const { user } = useAuth();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Socket connection setup
  useEffect(() => {
    console.log('Initial mount, user:', user);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setError('Authentication required');
      return;
    }

    console.log('Connecting socket with token...');
    const socket = connectSocket(token);
    
    socket.on('connect', () => {
      console.log('Socket connected in video call');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error in video call:', error);
      setError('Failed to connect to server');
      setSocketConnected(false);
    });

    return () => {
      console.log('Cleaning up socket connection...');
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
        setCall(callData);
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError(err.response?.data?.message || 'Failed to fetch call details');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchCallDetails();
    } else {
      console.error('No callId provided');
      setError('Invalid call ID');
    }
  }, [callId]);

  // WebRTC setup
  useEffect(() => {
    if (!call || !user || !socketConnected) {
      console.log('Waiting for prerequisites:', {
        hasCall: !!call,
        hasUser: !!user,
        isSocketConnected: socketConnected
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
        }
      );
    } catch (err) {
      console.error('Error in WebRTC setup:', err);
      setError('Failed to setup video call');
    }

    return () => {
      if (cleanup) {
        console.log('Cleaning up WebRTC...');
        cleanup();
      }
    };
  }, [call, user, socketConnected]);

  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/80 text-red-100 px-6 py-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading || !socketConnected) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/80 text-white px-6 py-4 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          {isLoading ? 'Loading call details...' : 'Connecting to server...'}
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
      </div>
    </div>
  );
};

export default VideoCall; 