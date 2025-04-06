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
        
        // Don't set srcObject if it's already set to the same stream to avoid interruption
        if (remoteVideoRef.current.srcObject !== event.streams[0]) {
          // Save the current play state
          const wasPlaying = !remoteVideoRef.current.paused;
          
          // Set the new stream
          remoteVideoRef.current.srcObject = event.streams[0];
          
          // Only call play() if the video was already playing or hasn't started yet
          if (wasPlaying || remoteVideoRef.current.readyState < 1) {
            // Use requestAnimationFrame to delay the play call slightly
            requestAnimationFrame(() => {
              // Check if the video element is still in the DOM before playing
              if (remoteVideoRef.current) {
                remoteVideoRef.current.play()
                  .then(() => console.log('Remote video playback started'))
                  .catch(err => {
                    console.error('Error playing remote video:', err);
                    // Try again after a short delay if it failed
                    setTimeout(() => {
                      if (remoteVideoRef.current) {
                        remoteVideoRef.current.play().catch(e => 
                          console.error('Error on retry playing remote video:', e)
                        );
                      }
                    }, 1000);
                  });
              }
            });
          }
        }
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Generated ICE candidate:', event.candidate.type);
        socket.emit('ice-candidate', {
          callId: call._id,
          candidate: event.candidate,
          from: user.userId
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

    // IMPORTANT: FIXED APPROACH - Use the URL path to determine initiator
    // If we're on the operator path, we're the initiator
    console.log('CURRENT URL PATH:', window.location.pathname);
    
    // Direct flag check - most reliable
    let isInitiator = !!user.isOperator;
    
    // Fallback: URL-based detection
    if (!isInitiator) {
      isInitiator = window.location.pathname.includes('/operator/') || 
                   window.location.pathname.startsWith('/operator');
    }
                     
    // Additional fallback with roles if needed
    if (!isInitiator) {
      const roleFromUser = String(user.role || '').toLowerCase();
      const roleFromStorage = String(localStorage.getItem('userRole') || '').toLowerCase();
      
      if (roleFromUser.includes('operator') || roleFromStorage.includes('operator')) {
        isInitiator = true;
        console.log('Setting as initiator based on role', roleFromUser, roleFromStorage);
      }
    }
    
    // Debug all flags
    console.log('**************** INITIATOR DECISION ****************');
    console.log('IS INITIATOR:', isInitiator);
    console.log('DIRECT FLAG:', !!user.isOperator);
    console.log('URL PATH:', window.location.pathname);
    console.log('USER ROLE:', user.role);
    console.log('LOCALSTORAGE ROLE:', localStorage.getItem('userRole'));
    console.log('*****************************************************');

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

    // Create an offer/answer regardless of initiator after a timeout
    // This ensures at least one side tries to initiate if normal flow fails
    if (isInitiator) {
      // Set a fallback timer to create offer if peer-joined event doesn't happen
      setTimeout(() => {
        if (peerConnection.signalingState === 'stable' && 
            peerConnection.connectionState !== 'connected') {
          console.log('FALLBACK: Creating offer as operator after timeout');
          createAndSendOffer();
        }
      }, 5000); // 5 second timeout
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
        // Save the current play state
        const wasPlaying = !remoteVideoRef.current.paused;
        
        // Only call play() if the video was already playing or hasn't started yet
        if (wasPlaying || remoteVideoRef.current.readyState < 1) {
          // Use requestAnimationFrame to delay the play call slightly
          requestAnimationFrame(() => {
            // Check if the video element is still in the DOM before playing
            if (remoteVideoRef.current) {
              remoteVideoRef.current.play()
                .then(() => console.log('Remote video playback started in handleTrack'))
                .catch(err => {
                  console.error('Error playing remote video in handleTrack:', err);
                  // Try again after a short delay if it failed
                  setTimeout(() => {
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.play().catch(e => 
                        console.error('Error on retry playing remote video in handleTrack:', e)
                      );
                    }
                  }, 1000);
                });
            }
          });
        }
      }
    }
  };
}; 