import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket, SOCKET_EVENTS, isSocketConnected } from '../../utils/socket';
import { setupWebRTC } from '../../utils/webrtc';
import { getCallById, endCall } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross1 } from "react-icons/rx";

const VideoCall = () => {
  const { callId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(isSocketConnected());
  const [webRTCInitialized, setWebRTCInitialized] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [isReferred, setIsReferred] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Socket connection setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setError('Authentication required');
      return;
    }

    console.log('Setting up socket connection...');
    const socket = connectSocket(token);

    // Listen for socket status changes
    const handleSocketStatus = (event) => {
      console.log('Socket status changed:', event.detail);
      setSocketConnected(event.detail);
    };

    window.addEventListener(SOCKET_EVENTS.STATUS_CHANGE, handleSocketStatus);

    // Set initial socket status
    setSocketConnected(socket?.connected || false);

    return () => {
      console.log('Cleaning up video call...');
      window.removeEventListener(SOCKET_EVENTS.STATUS_CHANGE, handleSocketStatus);
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
        // Initialize doctor advice and referred status from call data
        if (callData.doctorAdvice) {
          setDoctorAdvice(callData.doctorAdvice);
        }
        if (callData.referred !== undefined) {
          setIsReferred(callData.referred);
        }
        
        // Check if the current user is a doctor
        const userRole = localStorage.getItem('userRole');
        setIsDoctor(userRole === 'doctor');
        console.log('User role:', userRole, 'Is doctor:', userRole === 'doctor');
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch call details');
        navigate(`/${auth?.role || 'operator'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchCallDetails();
    } else {
      console.error('No callId provided');
      setError('Invalid call ID');
      navigate(`/${auth?.role || 'operator'}`);
    }
  }, [callId, navigate, auth?.role]);

  // WebRTC setup
  useEffect(() => {
    if (!call || !socketConnected || webRTCInitialized) {
      console.log('Waiting for prerequisites or WebRTC already initialized:', {
        hasCall: !!call,
        hasUser: true,
        isSocketConnected: socketConnected,
        isWebRTCInitialized: webRTCInitialized
      });
      return;
    }

    console.log('All prerequisites met, setting up WebRTC...');
    console.log('Call:', call);
    console.log('Socket connected:', socketConnected);
    console.log('User auth data:', {
      authUser: auth?.user,
      userIdFromStorage: localStorage.getItem('userId'),
      userRoleFromStorage: localStorage.getItem('userRole')
    });

    let localStream = null;
    let cleanupFunction = null;

    const setupCall = async () => {
      try {
        // Request user media before setting up WebRTC
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream = stream;
        console.log('Got media stream:', stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const userRole = localStorage.getItem('userRole');
        console.log('Setting up call with role:', userRole);

        // Force-detected operator from URL - extremely reliable
        const isOperator = window.location.pathname.includes('/operator') ||
          userRole === 'operator';
        console.log('Force-detected operator from URL:', isOperator);

        cleanupFunction = setupWebRTC(
          call,
          {
            userId: auth?.user?.id || localStorage.getItem('userId'),
            role: userRole,
            _id: localStorage.getItem('userId'),
            isOperator: isOperator // Direct flag for initiator logic
          },
          localVideoRef,
          remoteVideoRef,
          peerConnectionRef,
          (error) => {
            console.error('WebRTC error:', error);
            setError('Failed to establish video connection');
            setWebRTCInitialized(false);
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
          }
        );

        setWebRTCInitialized(true);
        console.log('WebRTC setup completed successfully');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Failed to access camera/microphone. Please ensure permissions are granted.');
        setWebRTCInitialized(false);
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
      }
    };

    setupCall();

    // Cleanup function
    return () => {
      console.log('Cleaning up WebRTC...');
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }
      if (typeof cleanupFunction === 'function') {
        cleanupFunction();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setWebRTCInitialized(false);
    };
  }, [call, socketConnected]);

  const handleEndCall = async () => {
    try {
      setIsEndingCall(true);
      console.log('Ending call...');

      // Stop all tracks in the local stream
      if (localVideoRef.current?.srcObject) {
        console.log('Stopping local tracks...');
        localVideoRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped local track:', track.kind);
        });
        localVideoRef.current.srcObject = null;
      }

      // Stop all tracks in the remote stream
      if (remoteVideoRef.current?.srcObject) {
        console.log('Stopping remote tracks...');
        remoteVideoRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped remote track:', track.kind);
        });
        remoteVideoRef.current.srcObject = null;
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        console.log('Closing peer connection...');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Emit socket event to notify other participant
      const socket = getSocket();
      if (socket?.connected) {
        console.log('Emitting call-ended event...');
        socket.emit('call-ended', { callId });
      }

      // Only include doctorAdvice and referred if the user is a doctor
      const callUpdateData = isDoctor 
        ? {
            doctorAdvice: doctorAdvice || '',
            referred: Boolean(isReferred),
            doctor: {
              name: call?.doctor?.name || ''
            }
          }
        : {}; // Empty object for operators
      
      console.log('Call update payload:', JSON.stringify(callUpdateData));
      console.log('Is doctor:', isDoctor);
      if (isDoctor) {
        console.log('Including doctor advice:', doctorAdvice);
        console.log('Including referred status:', isReferred, typeof isReferred);
        console.log('Including doctor name:', call?.doctor?.name);
      }
      
      const response = await endCall(callId, callUpdateData);
      console.log('Call updated successfully, response:', response);

      // Disconnect socket
      console.log('Disconnecting socket...');
      disconnectSocket();

      // Navigate to respective dashboard
      const userRole = localStorage.getItem('userRole');
      console.log('Navigating to dashboard for role:', userRole);
      navigate(`/${userRole}`);
    } catch (err) {
      console.error('Error ending call:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);

      // Handle 403 error specifically
      if (err.response?.status === 403) {
        setError('You are not authorized to end this call. Please contact support.');
        return; // Don't navigate if unauthorized
      }

      // Handle token expiration
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        // Navigate to login
        navigate('/');
        return;
      }

      setError('Failed to end call properly');
      // Even if the API call fails, ensure we clean up the media
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        remoteVideoRef.current.srcObject = null;
      }
    } finally {
      setIsEndingCall(false);
    }
  };

  // Add socket event listener for call ended by other participant
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('call-ended', ({ callId: endedCallId }) => {
        if (endedCallId === callId) {
          console.log('Call ended by other participant');

          // Stop video streams
          if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
          }
          if (remoteVideoRef.current?.srcObject) {
            remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            remoteVideoRef.current.srcObject = null;
          }

          // Close peer connection
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }

          // Navigate to dashboard
          const userRole = localStorage.getItem('userRole');
          if (!userRole) {
            // If no role found, clear auth and go to login
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/');
            return;
          }
          console.log('Navigating to dashboard for role:', userRole);
          navigate(`/${userRole}`);
        }
      });

      return () => {
        socket.off('call-ended');
      };
    }
  }, [callId, navigate]);

  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/80 text-red-100 px-6 py-4 rounded-lg text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
              const userRole = localStorage.getItem('userRole');
              if (!userRole) {
                // If no role found, clear auth and go to login
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/');
                return;
              }
              navigate(`/${userRole}`);
            }}
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
          {!socketConnected && (
            <p className="mt-2 text-sm text-gray-400">
              Attempting to establish connection...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center relative">
      <div className="w-full h-full relative">
        {/* Remote Video */}
        <div className="w-full h-full relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Only show side panel button for doctors */}
          {isDoctor && (
            <div className='absolute top-4 left-4 z-20'>
              <button 
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                className="text-white bg-gray-800/50 p-2 rounded-full hover:bg-gray-700/70 transition-all duration-300"
              >
                {isSidePanelOpen ? (
                  <RxCross1 className='text-xl' />
                ) : (
                  <RxHamburgerMenu className='text-xl' />
                )}
              </button>
            </div>
          )}
          
          {/* Side Panel - only for doctors */}
          {isDoctor && (
            <div 
              className={`absolute top-0 left-0 h-full bg-white z-10 transition-all duration-300 ease-in-out overflow-y-scroll ${
                isSidePanelOpen ? 'w-1/3 opacity-100' : 'w-0 opacity-0'
              } `}
            >
              <div className="px-6 pb-6 pt-20 w-full">
                <h2 className="text-2xl font-medium text-gray-800 mb-4">Patient Details</h2>
                
                {call && (
                  <div className="space-y-4">
                    <div>
                      {/* <h3 className="text-lg font-medium text-gray-700">Patient</h3> */}
                      <p className="">Name: {call.patient?.name || 'Unknown'}</p>
                      <p className="">Age: {call.patient?.age}</p>
                      <p className="">Sex: {call.patient?.sex}</p>
                      <p className="">Height: {call.patient?.height} cm</p>
                      <p className="">Weight: {call.patient?.weight} kg</p>
                      <p className="">Oxygen Level: {call.patient?.oxygenLevel}%</p>
                      <p className="">Temperature: {call.patient?.temperature}°C</p>
                      <p className="">Pulse: {call.patient?.pulse} BPM</p>
                      <p className="">Blood Pressure: {call.patient?.bloodPressure?.systolic}/{call.patient?.bloodPressure?.diastolic} mmHg</p>
                    </div>
                    
                    {call.patient?.symptoms && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-700">Symptoms</h3>
                        <p className="text-gray-600">{call.patient.symptoms}</p>
                      </div>
                    )}
                    
                    {/* Doctor's Advice Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Doctor's Advice</h3>
                      <textarea
                        value={doctorAdvice}
                        onChange={(e) => setDoctorAdvice(e.target.value)}
                        placeholder="Write your advice for the patient here..."
                        className="w-full h-40 p-3 border border-gray-300 rounded-md outline-blue-500 resize-none"
                      ></textarea>
                      <p className="text-sm text-gray-500 mt-1">
                        This advice will be saved when you end the call.
                      </p>
                    </div>
                    
                    {/* Referral Status Section */}
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Referral Status</h3>
                      <select
                        value={isReferred.toString()}
                        onChange={(e) => setIsReferred(e.target.value === "true")}
                        className="w-full p-3 border border-gray-300 rounded-md outline-blue-500"
                      >
                        <option value="false">Not Referred</option>
                        <option value="true">Referred to Hospital</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Select whether the patient needs to be referred to a hospital for further treatment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute bottom-5 right-5 w-60 h-[180px] rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={handleEndCall}
            disabled={isEndingCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEndingCall ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>Ending Call...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  <path d="M16.707 3.293a1 1 0 010 1.414L15.414 6l1.293 1.293a1 1 0 01-1.414 1.414L14 7.414l-1.293 1.293a1 1 0 11-1.414-1.414L12.586 6l-1.293-1.293a1 1 0 011.414-1.414L14 4.586l1.293-1.293a1 1 0 011.414 0z" />
                </svg>
                <span>End Call</span>
              </>
            )}
          </button>
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