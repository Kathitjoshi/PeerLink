import React, { useState } from 'react';
import { Trash2, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const DeleteAccount = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('⚠️ Are you ABSOLUTELY sure? This action CANNOT be undone!')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/account/delete', {
        data: { password },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-red-600">Delete Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-2">Warning: This action is permanent!</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All your data will be deleted</li>
                <li>All your bookings/slots will be removed</li>
                <li>This cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting...' : 'Delete Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccount;