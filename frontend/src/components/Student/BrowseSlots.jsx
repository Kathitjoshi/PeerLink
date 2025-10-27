import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { slotsAPI, bookingsAPI } from '../../services/api';
import SlotCard from '../Calendar/SlotCard';

const BrowseSlots = ({ setNotification }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    date: '',
  });

  const loadSlots = async () => {
    setLoading(true);
    try {
      const response = await slotsAPI.getAvailable(filters);
      setSlots(response.data);
    } catch (error) {
      console.error('Load slots error:', error);
      setNotification({
        message: error.response?.data?.error || 'Failed to load slots',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleBook = async (slot) => {
    try {
      await bookingsAPI.create({ slot_id: slot.id });
      setNotification({
        message: 'Session booked successfully! Confirmation email sent.',
        type: 'success',
      });
      loadSlots();
    } catch (error) {
      console.error('Booking error:', error);
      setNotification({
        message: error.response?.data?.error || 'Booking failed',
        type: 'error',
      });
    }
  };

  const handleSearch = () => {
    loadSlots();
  };

  const handleClearFilters = () => {
    setFilters({ subject: '', date: '' });
    setTimeout(() => loadSlots(), 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Browse Available Sessions</h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by subject..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 text-lg">No available slots found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onBook={handleBook}
              showTutor={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseSlots;