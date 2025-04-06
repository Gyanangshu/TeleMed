import { getSocket } from './socket';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

export const setupWebRTC = async (call, user, localVideoRef, remoteVideoRef, peerConnectionRef, onError) => {
  try {
    console.log('Setting up WebRTC...');
    const socket = getSocket();
    if (!socket) {
      console.error('Socket not connected');
      onError('Socket not connected');
      return;
    }

    // Join the call room
    console.log('Joining call room:', call._id);
    socket.emit('join-call', call._id);

    const iceCandidatesQueue = [];
    let hasRemoteDescription = false;

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
      console.log('Remote streams:', event.streams);
      if (remoteVideoRef.current && event.streams[0]) {
        console.log('Setting remote stream');
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(err => {
          console.error('Error playing remote video:', err);
        });
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Generated ICE candidate:', event.candidate.type);
        socket.emit('ice-candidate', {
          callId: call._id,
          candidate: event.candidate
        });
      } else {
        console.log('ICE gathering complete');
      }
    };

    // Handle ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', peerConnection.iceGatheringState);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      switch (peerConnection.connectionState) {
        case 'connected':
          console.log('Peers connected!');
          break;
        case 'disconnected':
        case 'failed':
          console.log('Peer connection failed/disconnected, attempting to restart...');
          restartIce();
          break;
        case 'closed':
          console.log('Peer connection closed');
          break;
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed') {
        console.log('ICE connection failed, restarting ICE...');
        restartIce();
      }
    };

    // Handle signaling state changes
    peerConnection.onsignalingstatechange = () => {
      console.log('Signaling state:', peerConnection.signalingState);
    };

    const restartIce = async () => {
      try {
        if (isInitiator) {
          console.log('Restarting ICE as initiator...');
          const offer = await peerConnection.createOffer({ iceRestart: true });
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', {
            callId: call._id,
            offer
          });
        }
      } catch (err) {
        console.error('Error restarting ICE:', err);
        onError?.(err);
      }
    };

    // Process queued ICE candidates
    const processIceCandidates = () => {
      console.log('Processing queued ICE candidates:', iceCandidatesQueue.length);
      while (iceCandidatesQueue.length) {
        const candidate = iceCandidatesQueue.shift();
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.error('Error adding queued ICE candidate:', err));
      }
    };

    // Set up socket event handlers
    socket.on('ice-candidate', async ({ candidate, from }) => {
      try {
        if (from === user._id) {
          console.log('Ignoring own ICE candidate');
          return;
        }
        
        console.log('Received ICE candidate from peer:', candidate.type);
        if (hasRemoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate');
        } else {
          console.log('Queueing ICE candidate');
          iceCandidatesQueue.push(candidate);
        }
      } catch (err) {
        console.error('Error handling ICE candidate:', err);
        onError?.(err);
      }
    });

    // Determine if user is the call initiator
    // This needs to be defined before peer-joined handler
    const operatorId = call.operator?._id?.toString() || call.operator?.id?.toString();
    const userId = user.userId?.toString();
    const isInitiator = operatorId === userId || user.role === 'operator';
    
    console.log('Is initiator check:', {
      'operatorId': operatorId,
      'userId': userId,
      'user.role': user.role,
      result: isInitiator
    });
    console.log('Is initiator:', isInitiator);

    // Handle peer joined event
    socket.on('peer-joined', ({ userId, role }) => {
      console.log('Peer joined:', userId, role);
      if (isInitiator) {
        console.log('Creating new offer for joined peer...');
        createAndSendOffer();
      }
    });

    const createAndSendOffer = async () => {
      try {
        console.log('Creating new offer...');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created and set local offer');
        
        socket.emit('offer', {
          callId: call._id,
          offer
        });
      } catch (err) {
        console.error('Error creating/sending offer:', err);
        onError?.(err);
      }
    };

    if (isInitiator) {
      // Create and send offer
      socket.on('answer', async ({ answer, from }) => {
        try {
          if (from === user._id) {
            console.log('Ignoring own answer');
            return;
          }
          
          console.log('Received answer from peer');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Set remote description from answer');
          hasRemoteDescription = true;
          processIceCandidates();
        } catch (err) {
          console.error('Error setting remote description:', err);
          onError?.(err);
        }
      });

      // Initial offer creation
      await createAndSendOffer();
    } else {
      // Handle incoming offer
      socket.on('offer', async ({ offer, from }) => {
        try {
          if (from === user._id) {
            console.log('Ignoring own offer');
            return;
          }
          
          console.log('Received offer from peer');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Set remote description from offer');
          hasRemoteDescription = true;
          processIceCandidates();

          console.log('Creating answer...');
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

    // Handle peer disconnection
    socket.on('peer-disconnected', ({ userId }) => {
      if (userId !== user._id) {
        console.log('Peer disconnected, cleaning up...');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    });

    // Return cleanup function
    return () => {
      console.log('Cleaning up WebRTC...');
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      peerConnection.close();
      socket.off('ice-candidate');
      socket.off('offer');
      socket.off('answer');
      socket.off('peer-joined');
      socket.off('peer-disconnected');
      socket.emit('leave-call', call._id);
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