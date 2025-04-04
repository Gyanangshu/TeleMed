const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
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