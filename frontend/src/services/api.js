import axios from 'axios';

// API Base URL - update this to your Koyeb backend service URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR-BACKEND-SERVICE-NAME.koyeb.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important for cookies and auth
  withCredentials: false, // Set to true if using cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response from server');
      console.error('Check if backend is running at:', API_BASE_URL);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  me: () => api.get('/auth/me'),
  
  // Test endpoint
  test: () => api.get('/auth/test'),
};

export const slotsAPI = {
  // Create new slot (tutor only)
  create: (slotData) => api.post('/slots', slotData),
  
  // Get available slots
  getAvailable: (params) => api.get('/slots/available', { params }),
  
  // Get tutor's slots
  getMySlots: () => api.get('/slots/my-slots'),
  
  // Update slot
  update: (id, data) => api.put(`/slots/${id}`, data),
  
  // Delete slot
  delete: (id) => api.delete(`/slots/${id}`),
};

export const bookingsAPI = {
  // Create booking (student only)
  create: (bookingData) => api.post('/bookings', bookingData),
  
  // Get student's bookings
  getMyBookings: () => api.get('/bookings/my-bookings'),
  
  // Cancel booking
  cancel: (id) => api.delete(`/bookings/${id}`),
};

export const accountAPI = {
  // Delete account
  delete: (password) => api.delete('/account/delete', { data: { password } }),
};

export const healthAPI = {
  // Health check
  check: () => api.get('/health'),
};

// Export default api instance
export default api;

// Log API base URL on import
console.log('🔗 API Base URL:', API_BASE_URL);
