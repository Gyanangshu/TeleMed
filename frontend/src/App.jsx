import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { connectSocket } from './utils/socket';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Components
import OperatorDashboard from './pages/operator/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Call Components
import VideoCall from './pages/call/VideoCall';

// Layout Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/operator" element={
          <PrivateRoute role="operator">
            <OperatorDashboard />
          </PrivateRoute>
        } />
        <Route path="/doctor" element={
          <PrivateRoute role="doctor">
            <DoctorDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/call/:callId" element={
          <PrivateRoute>
            <VideoCall />
          </PrivateRoute>
        } />
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App; 