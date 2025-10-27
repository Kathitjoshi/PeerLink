import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, User, BookOpen, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeleteAccount from './DeleteAccount';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isTutor, isStudent } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <BookOpen className="w-6 h-6" />
              <h1 className="text-xl font-bold">P2P Tutoring Scheduler</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info - NO DROPDOWN */}
              <div className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <div className="text-sm">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-blue-200 text-xs capitalize">{user?.role}</div>
                </div>
              </div>

              {isTutor && (
                <button
                  onClick={() => navigate('/tutor/slots')}
                  className="px-4 py-2 rounded-lg transition bg-blue-700 hover:bg-blue-800"
                >
                  My Slots
                </button>
              )}

              {isStudent && (
                <>
                  <button
                    onClick={() => navigate('/browse')}
                    className="px-4 py-2 rounded-lg transition bg-blue-700 hover:bg-blue-800"
                  >
                    Browse Slots
                  </button>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="px-4 py-2 rounded-lg transition bg-blue-700 hover:bg-blue-800"
                  >
                    My Bookings
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/calendar')}
                className="px-4 py-2 rounded-lg transition bg-blue-700 hover:bg-blue-800"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* DELETE ACCOUNT BUTTON - PERMANENT */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              {/* LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showDeleteModal && (
        <DeleteAccount
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default Navbar;