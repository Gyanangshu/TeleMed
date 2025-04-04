import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DoctorDashboard from './pages/doctor/Dashboard';
import OperatorDashboard from './pages/operator/Dashboard';
import VideoCall from './pages/call/VideoCall';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/doctor"
            element={
              <PrivateRoute>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/operator"
            element={
              <PrivateRoute>
                <OperatorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/call/:callId"
            element={
              <PrivateRoute>
                <VideoCall />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 