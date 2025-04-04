import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../../utils/socket';
import { getCalls } from '../../services/callService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await getCalls();
        setCalls(data);
      } catch (err) {
        setError('Failed to fetch calls');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleJoinCall = (callId) => {
    navigate(`/call/${callId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Doctor Dashboard</h1>
      <div className="calls-list">
        {calls.map((call) => (
          <div key={call._id} className="call-card">
            <h3>Call from {call.patient.name}</h3>
            <p>Status: {call.status}</p>
            <button onClick={() => handleJoinCall(call._id)}>Join Call</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 