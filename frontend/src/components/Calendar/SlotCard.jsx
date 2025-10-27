import React from 'react';
import { Clock, User, BookOpen, Calendar } from 'lucide-react';

const SlotCard = ({ slot, onBook, onCancel, showTutor = true, isBooked = false }) => {
  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);
  const duration = Math.round((endTime - startTime) / 60000);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{slot.subject}</h3>
          {showTutor && slot.tutor_name && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <User className="w-4 h-4" />
              <span>{slot.tutor_name}</span>
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          slot.status === 'available' ? 'bg-green-100 text-green-700' :
          slot.status === 'booked' ? 'bg-blue-100 text-blue-700' :
          slot.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {slot.status}
        </span>
      </div>

      {slot.description && (
        <p className="text-gray-600 text-sm mb-4">{slot.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>{startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>
            {startTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })} - {endTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })} ({duration} min)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>{slot.booked_count || 0} / {slot.capacity} booked</span>
        </div>
      </div>

      {onBook && !isBooked && slot.status === 'available' && (
        <button
          onClick={() => onBook(slot)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Book Session
        </button>
      )}

      {onCancel && isBooked && (
        <button
          onClick={() => onCancel(slot)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
};

export default SlotCard;