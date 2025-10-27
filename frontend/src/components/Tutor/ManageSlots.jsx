import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import { slotsAPI } from '../../services/api';
import CreateSlot from './CreateSlot';
import SlotCard from '../Calendar/SlotCard';

const ManageSlots = ({ setNotification }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const response = await slotsAPI.getMySlots();
      setSlots(response.data);
    } catch (error) {
      setNotification({
        message: 'Failed to load slots',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    try {
      await slotsAPI.delete(slotId);
      setNotification({
        message: 'Slot deleted successfully',
        type: 'success',
      });
      loadSlots();
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'Failed to delete slot',
        type: 'error',
      });
    }
  };

  const upcomingSlots = slots.filter(s => new Date(s.start_time) > new Date());
  const pastSlots = slots.filter(s => new Date(s.start_time) <= new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Tutoring Slots</h2>
        <div className="flex space-x-2">
          <button
            onClick={loadSlots}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Slot</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading slots...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Slots</h3>
            {upcomingSlots.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No upcoming slots</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Create your first slot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSlots.map((slot) => (
                  <div key={slot.id} className="relative">
                    <SlotCard slot={slot} showTutor={false} />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pastSlots.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Past Slots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSlots.map((slot) => (
                  <div key={slot.id} className="opacity-60">
                    <SlotCard slot={slot} showTutor={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateSlot
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadSlots}
          setNotification={setNotification}
        />
      )}
    </div>
  );
};

export default ManageSlots;