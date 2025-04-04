import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '../../utils/socket';
import { setupWebRTC } from '../../utils/webrtc';
import { getCallById } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';
import './VideoCall.css';

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
    let socket = null;

    const fetchCallDetails = async () => {
      try {
        console.log('Fetching call details for:', callId);
        const callData = await getCallById(callId);
        console.log('Call details received:', callData);
        setCall(callData);
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError('Failed to fetch call details');
      }
    };

    const initializeSocket = async () => {
      try {
        console.log('Initializing socket connection...');
        socket = connectSocket(localStorage.getItem('token'));
        
        socket.on('connect', () => {
          console.log('Socket connected, fetching call details...');
          fetchCallDetails();
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setError('Failed to connect to the server');
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            socket.connect();
          }
        });
      } catch (err) {
        console.error('Error initializing socket:', err);
        setError('Failed to initialize connection');
      }
    };

    initializeSocket();

    return () => {
      console.log('Cleaning up socket connection...');
      if (socket) {
        disconnectSocket();
      }
    };
  }, [callId]);

  useEffect(() => {
    if (call && localVideoRef.current && remoteVideoRef.current) {
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