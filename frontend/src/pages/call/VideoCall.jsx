import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import socket, { connectSocket } from '../../utils/socket';
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  handleIceCandidate,
  addTracks,
  handleTrack,
} from '../../utils/webrtc';

export default function VideoCall() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [referred, setReferred] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    fetchCallDetails();
    setupWebRTC();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const fetchCallDetails = async () => {
    try {
      const response = await axios.get(`/calls/${callId}`);
      setCall(response.data);
      setIsDoctor(response.data.doctor?._id === localStorage.getItem('userId'));
    } catch (err) {
      setError('Failed to fetch call details');
    } finally {
      setLoading(false);
    }
  };

  const setupWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      addTracks(peerConnection, stream);
      handleTrack(peerConnection, remoteVideoRef);
      handleIceCandidate(peerConnection, socket, callId);

      socket.on('ice-candidate', async ({ candidate }) => {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      });

      if (isDoctor) {
        socket.on('offer', async ({ offer }) => {
          try {
            const answer = await createAnswer(peerConnection, offer);
            socket.emit('answer', { callId, answer });
          } catch (err) {
            console.error('Error creating answer:', err);
          }
        });
      } else {
        const offer = await createOffer(peerConnection);
        socket.emit('offer', { callId, offer });
      }

      socket.on('answer', async ({ answer }) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      });
    } catch (err) {
      setError('Failed to access camera and microphone');
    }
  };

  const handleEndCall = async () => {
    try {
      await axios.post(`/calls/${callId}/end`, {
        consultationCompleted,
        referred,
        doctorAdvice,
      });
      navigate(`/${localStorage.getItem('userRole')}`);
    } catch (err) {
      setError('Failed to end call');
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
    <div className="h-screen flex">
      {/* Left Panel - Patient Info & Doctor's Advice */}
      <div className="w-1/3 bg-white p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Patient Information</h2>
            <div className="mt-4 space-y-2">
              <p><span className="font-medium">Name:</span> {call?.patient.name}</p>
              <p><span className="font-medium">Age:</span> {call?.patient.age}</p>
              <p><span className="font-medium">Sex:</span> {call?.patient.sex}</p>
              <p><span className="font-medium">Height:</span> {call?.patient.height} cm</p>
              <p><span className="font-medium">Weight:</span> {call?.patient.weight} kg</p>
              <p><span className="font-medium">Oxygen Level:</span> {call?.patient.oxygenLevel}%</p>
              <p>
                <span className="font-medium">Blood Pressure:</span>{' '}
                {call?.patient?.bloodPressure?.systolic}/{call?.patient?.bloodPressure?.diastolic} mmHg
              </p>
              <p><span className="font-medium">Symptoms:</span> {call?.patient?.symptoms}</p>
            </div>
          </div>

          {isDoctor && (
            <div>
              <h2 className="text-lg font-medium text-gray-900">Doctor's Advice</h2>
              <textarea
                value={doctorAdvice}
                onChange={(e) => setDoctorAdvice(e.target.value)}
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={6}
                placeholder="Enter your advice here..."
              />
            </div>
          )}

          {isDoctor && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consultation Completed
                </label>
                <select
                  value={consultationCompleted}
                  onChange={(e) => setConsultationCompleted(e.target.value === 'true')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Refer Patient
                </label>
                <select
                  value={referred}
                  onChange={(e) => setReferred(e.target.value === 'true')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <button
                onClick={handleEndCall}
                disabled={!consultationCompleted || !referred}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                End Call
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Video Call */}
      <div className="flex-1 bg-gray-900 p-6">
        <div className="relative h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
} 