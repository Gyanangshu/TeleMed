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
      <div className="video-call-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="video-call-container">
        <div className="loading-message">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        </div>
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 