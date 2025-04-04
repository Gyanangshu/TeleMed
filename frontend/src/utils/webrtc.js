import { getSocket } from './socket';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const setupWebRTC = async (call, user, localVideoRef, remoteVideoRef, peerConnectionRef, onError) => {
  try {
    console.log('Setting up WebRTC...');
    const socket = getSocket();
    if (!socket?.connected) {
      throw new Error('Socket not connected');
    }

    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    console.log('Got local media stream');

    // Set up local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Create and configure peer connection
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    console.log('Added local tracks to peer connection');

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = new MediaStream();
        }
        remoteVideoRef.current.srcObject.addTrack(event.track);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socket.emit('ice-candidate', {
          callId: call._id,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    // Set up socket event handlers
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate');
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
        onError?.(err);
      }
    });

    // Determine if user is the call initiator
    const isInitiator = call.operator?._id === user?._id;
    console.log('Is initiator:', isInitiator);

    if (isInitiator) {
      // Create and send offer
      socket.on('answer', async ({ answer }) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Set remote description from answer');
        } catch (err) {
          console.error('Error setting remote description:', err);
          onError?.(err);
        }
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('Created and set local offer');
      
      socket.emit('offer', {
        callId: call._id,
        offer
      });
    } else {
      // Handle incoming offer
      socket.on('offer', async ({ offer }) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Set remote description from offer');

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log('Created and set local answer');

          socket.emit('answer', {
            callId: call._id,
            answer
          });
        } catch (err) {
          console.error('Error handling offer:', err);
          onError?.(err);
        }
      });
    }

    // Return cleanup function
    return () => {
      console.log('Cleaning up WebRTC...');
      stream.getTracks().forEach(track => track.stop());
      peerConnection.close();
      socket.off('ice-candidate');
      socket.off('offer');
      socket.off('answer');
    };
  } catch (err) {
    console.error('Error setting up WebRTC:', err);
    onError?.(err);
    throw err;
  }
};

export const createPeerConnection = () => {
  const pc = new RTCPeerConnection(configuration);
  console.log('Created new peer connection');
  return pc;
};

export const createOffer = async (peerConnection) => {
  try {
    console.log('Creating offer...');
    const offer = await peerConnection.createOffer();
    console.log('Offer created:', offer);
    await peerConnection.setLocalDescription(offer);
    console.log('Local description set');
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const createAnswer = async (peerConnection, offer) => {
  try {
    console.log('Creating answer for offer:', offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('Remote description set');
    const answer = await peerConnection.createAnswer();
    console.log('Answer created:', answer);
    await peerConnection.setLocalDescription(answer);
    console.log('Local description set');
    return answer;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const handleIceCandidate = (peerConnection, socket, callId) => {
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('New ICE candidate:', event.candidate);
      socket.emit('ice-candidate', {
        callId,
        candidate: event.candidate
      });
    } else {
      console.log('ICE gathering completed');
    }
  };

  // Add connection state change logging
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state changed:', peerConnection.connectionState);
  };

  // Add ICE connection state change logging
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state changed:', peerConnection.iceConnectionState);
  };
};

export const addTracks = (peerConnection, stream) => {
  console.log('Adding tracks to peer connection');
  stream.getTracks().forEach(track => {
    console.log('Adding track:', track.kind);
    peerConnection.addTrack(track, stream);
  });
};

export const handleTrack = (peerConnection, remoteVideoRef) => {
  peerConnection.ontrack = (event) => {
    console.log('Received track event:', event);
    console.log('Track kind:', event.track.kind);
    console.log('Streams:', event.streams);
    
    if (remoteVideoRef.current) {
      if (!remoteVideoRef.current.srcObject) {
        console.log('Creating new MediaStream for remote video');
        remoteVideoRef.current.srcObject = new MediaStream();
      }
      
      const stream = remoteVideoRef.current.srcObject;
      console.log('Current stream tracks:', stream.getTracks().length);
      
      // Remove any existing tracks of the same kind
      stream.getTracks().forEach(track => {
        if (track.kind === event.track.kind) {
          console.log('Removing existing track:', track.kind);
          stream.removeTrack(track);
        }
      });
      
      console.log('Adding new track:', event.track.kind);
      stream.addTrack(event.track);
      
      // Ensure the video element is playing
      if (event.track.kind === 'video') {
        remoteVideoRef.current.play().catch(err => {
          console.error('Error playing remote video:', err);
        });
      }
    }
  };
}; 