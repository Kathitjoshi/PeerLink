import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import SlotCard from '../Calendar/SlotCard';

const MyBookings = ({ setNotification }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      setNotification({
        message: 'Failed to load bookings',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(booking.id);
      setNotification({
        message: 'Booking cancelled successfully',
        type: 'success',
      });
      loadBookings();
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'Cancellation failed',
        type: 'error',
      });
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status !== 'confirmed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>
        <button
          onClick={loadBookings}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading bookings...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Sessions</h3>
            {confirmedBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No upcoming bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {confirmedBookings.map((booking) => (
                  <SlotCard
                    key={booking.id}
                    slot={booking}
                    onCancel={() => handleCancel(booking)}
                    showTutor={true}
                    isBooked={true}
                  />
                ))}
              </div>
            )}
          </div>

          {pastBookings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Past Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="opacity-60">
                    <SlotCard slot={booking} showTutor={true} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;