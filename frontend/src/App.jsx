import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Notification from './components/Layout/Notification';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BrowseSlots from './components/Student/BrowseSlots';
import MyBookings from './components/Student/MyBookings';
import ManageSlots from './components/Tutor/ManageSlots';
import CalendarView from './components/Calendar/CalendarView';

function App() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, isTutor, isStudent } = useAuth();
  const [notification, setNotification] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {isAuthenticated && <Navbar />}
      
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login 
                onSwitchToRegister={() => navigate('/register')} 
                setNotification={setNotification} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? (
              <Register 
                onSwitchToLogin={() => navigate('/login')} 
                setNotification={setNotification} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              isTutor ? <Navigate to="/tutor/slots" replace /> : <Navigate to="/browse" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/browse"
          element={
            isStudent ? (
              <BrowseSlots setNotification={setNotification} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            isStudent ? (
              <MyBookings setNotification={setNotification} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/tutor/slots"
          element={
            isTutor ? (
              <ManageSlots setNotification={setNotification} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/calendar"
          element={
            isAuthenticated ? (
              <CalendarView 
                setNotification={setNotification} 
                userRole={user?.role} 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;