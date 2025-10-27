import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { slotsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CalendarView = ({ setNotification }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('week');

  useEffect(() => {
    loadCalendar();
  }, [currentDate, view, user]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      if (user?.role === 'tutor') {
        const response = await slotsAPI.getMySlots();
        setItems(response.data);
      } else {
        const response = await bookingsAPI.getMyBookings();
        setItems(response.data);
      }
    } catch (error) {
      console.error('Calendar load error:', error);
      setNotification({
        message: 'Failed to load calendar',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const start = new Date(currentDate);
    if (view === 'week') {
      start.setDate(currentDate.getDate() - currentDate.getDay());
    } else {
      start.setDate(1);
    }
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getViewEndDate = () => {
    const end = new Date(currentDate);
    if (view === 'week') {
      end.setDate(currentDate.getDate() - currentDate.getDay() + 6);
    } else {
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInView = () => {
    const days = [];
    const start = getViewStartDate();
    const end = getViewEndDate();
    
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // THIS IS THE KEY FIX - Compare dates correctly
  const getItemsForDay = (day) => {
    return items.filter(item => {
      const itemDate = new Date(item.start_time);
      
      // Compare ONLY year, month, and day (ignore time and timezone)
      const sameYear = itemDate.getFullYear() === day.getFullYear();
      const sameMonth = itemDate.getMonth() === day.getMonth();
      const sameDay = itemDate.getDate() === day.getDate();
      
      return sameYear && sameMonth && sameDay;
    });
  };

  const formatDateHeader = () => {
    if (view === 'week') {
      const start = getViewStartDate();
      const end = getViewEndDate();
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const days = getDaysInView();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">{formatDateHeader()}</h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  view === 'week'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  view === 'month'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
            </div>

            {/* Navigation */}
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => {
              const dayItems = getItemsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 min-h-[200px] ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                  }`}
                >
                  {/* Day Header */}
                  <div className="mb-3">
                    <div className={`text-sm font-semibold ${
                      isToday ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isToday ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-2">
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center mt-8">No sessions</p>
                    ) : (
                      dayItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded p-2 hover:shadow-md transition cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-gray-800 truncate">
                            {item.subject}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(item.start_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user?.role === 'tutor' 
                              ? (item.student_names || 'No bookings')
                              : (item.tutor_name || 'Tutor')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.status} • {item.booked_count || 0}/{item.capacity || 1}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;