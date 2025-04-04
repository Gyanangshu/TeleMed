import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../../utils/socket';
import { setupWebRTC } from '../../utils/webrtc';
import { getCallById } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const VideoCall = () => {
  const { callId } = useParams();
  const { user } = useAuth();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        console.log('Fetching call details for:', callId);
        const callData = await getCallById(callId);
        console.log('Call details received:', callData);
        setCall(callData);
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError('Failed to fetch call details');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchCallDetails();
    }
  }, [callId]);

  useEffect(() => {
    if (call && user) {
      console.log('Setting up WebRTC...');
      const cleanup = setupWebRTC(
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

      return cleanup;
    }
  }, [call, user]);

  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/80 text-red-100 px-6 py-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/80 text-white px-6 py-4 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          Connecting...
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