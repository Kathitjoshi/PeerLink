# P2P Tutoring Scheduler/ Peer Link

A web-based peer-to-peer learning platform that enables students to offer tutoring slots and allows peers to browse and book one-on-one learning sessions.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [License](#license)
- [Contributors](#contributors)

---

## Features

### Core Functionality

#### User Management
- Role-based registration (Student/Tutor)
- Secure JWT authentication
- Password encryption with bcrypt
- Account deletion with password verification

#### Tutor Features
- Create and manage tutoring slots
- Set session capacity and duration
- View booked students
- Automatic conflict detection for overlapping slots
- Delete unused slots

#### Student Features
- Browse available tutoring sessions
- Search and filter by subject and date
- Book sessions with automatic conflict prevention
- View and manage bookings
- Cancel bookings (2-hour policy)

#### Calendar System
- Week and month view options
- Visual slot availability
- Real-time updates
- Color-coded interface

#### Notifications
- Email confirmations for registrations
- Booking confirmation emails
- Cancellation notifications
- In-app notification system

---

## Technology Stack

### Backend
- Runtime: Node.js (v16+)
- Framework: Express.js (v4.18.2)
- Database: PostgreSQL (v12+)
- Authentication: JSON Web Tokens (JWT)
- Password Hashing: bcrypt.js
- Email Service: Nodemailer
- Validation: Express Validator

### Frontend
- Library: React (v18.2.0)
- Build Tool: Vite (v5.0.0)
- Routing: React Router (v7.9.4)
- HTTP Client: Axios
- Styling: Tailwind CSS
- Icons: Lucide React

---

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- PostgreSQL (v12 or higher) - [Download](https://www.postgresql.org/download/)
- npm (comes with Node.js)
- Git (optional) - [Download](https://git-scm.com/)

---

## Installation

### 1. Clone the Repository

```bash
git clone  https://github.com/Kathitjoshi/PeerLink.git
cd PeerLink
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Application Configuration
APP_NAME=P2P Tutoring Scheduler
APP_VERSION=1.0.0

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2p_tutoring
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_secure_random_string_minimum_32_characters
JWT_EXPIRE=7d

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@p2ptutoring.com

# Other Configuration
FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=10
```

#### Important Notes:
- Replace `DB_PASSWORD` with your PostgreSQL password
- Generate a strong random string for `JWT_SECRET`
- Use Gmail App Password for `SMTP_PASSWORD` (not regular password)
  - Get it from: https://myaccount.google.com/apppasswords

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=P2P Tutoring Scheduler
```

---

## Database Setup

### 1. Create Database

Open PostgreSQL terminal:

```bash
psql -U postgres
```

Execute:

```sql
CREATE DATABASE p2p_tutoring;
\c p2p_tutoring
```

### 2. Run Schema Migration

From the project root:

```bash
psql -U postgres -d p2p_tutoring -f backend/models/schema.sql
```

Or manually copy and paste the SQL from `backend/models/schema.sql` into pgAdmin Query Tool.

### 3. Verify Tables

```sql
\dt
```

You should see:
- users
- slots
- bookings
- notifications

---

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Database connected successfully
Server running on port 5000
http://localhost:5000
Health check: http://localhost:5000/api/health
```

#### Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 500 ms
Local:   http://localhost:3000/
```

#### Access Application

Open browser and navigate to: **http://localhost:3000**

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend

```bash
cd backend
npm start
```

---

## Project Structure

```
p2p-tutoring-scheduler/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── slots.js
│   │   ├── bookings.js
│   │   └── account.js
│   ├── services/
│   │   └── emailService.js
│   ├── models/
│   │   └── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Calendar/
│   │   │   │   ├── CalendarView.jsx
│   │   │   │   └── SlotCard.jsx
│   │   │   ├── Tutor/
│   │   │   │   ├── CreateSlot.jsx
│   │   │   │   └── ManageSlots.jsx
│   │   │   ├── Student/
│   │   │   │   ├── BrowseSlots.jsx
│   │   │   │   └── MyBookings.jsx
│   │   │   └── Layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Notification.jsx
│   │   │       └── DeleteAccount.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
└── README.md
```

---

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" | "tutor"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": {...},
  "token": "jwt_token_here"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {...}
}
```

### Slot Endpoints

#### Create Slot (Tutor Only)
```
POST /api/slots
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "subject": "Mathematics",
  "description": "Calculus basics",
  "start_time": "2025-10-27T14:00:00Z",
  "end_time": "2025-10-27T15:00:00Z",
  "capacity": 1
}

Response: 201 Created
```

#### Get Available Slots
```
GET /api/slots/available?subject=Math&date=2025-10-27
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "subject": "Mathematics",
    "tutor_name": "John Tutor",
    "start_time": "2025-10-27T14:00:00Z",
    "end_time": "2025-10-27T15:00:00Z",
    "status": "available",
    "booked_count": 0,
    "capacity": 1
  }
]
```

#### Get Tutor's Slots
```
GET /api/slots/my-slots
Authorization: Bearer {token}

Response: 200 OK
```

#### Delete Slot
```
DELETE /api/slots/:id
Authorization: Bearer {token}

Response: 200 OK
```

### Booking Endpoints

#### Create Booking (Student Only)
```
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "slot_id": 1
}

Response: 201 Created
```

#### Get Student's Bookings
```
GET /api/bookings/my-bookings
Authorization: Bearer {token}

Response: 200 OK
```

#### Cancel Booking
```
DELETE /api/bookings/:id
Authorization: Bearer {token}

Response: 200 OK
```

### Account Endpoints

#### Delete Account
```
DELETE /api/account/delete
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "password": "user_password"
}

Response: 200 OK
```

---

## Testing

### Test User Accounts

Create test accounts for development:

#### Tutor Account:
- Name: John Tutor
- Email: tutor@test.com
- Password: password123
- Role: Tutor

#### Student Account:
- Name: Jane Student
- Email: student@test.com
- Password: password123
- Role: Student

### Manual Testing Workflow

#### 1. Register as Tutor
- Create account
- Create 2-3 tutoring slots with different subjects
- Verify slots appear in "My Slots"

#### 2. Register as Student
- Create account
- Browse available slots
- Book a session
- Verify booking appears in "My Bookings"

#### 3. Test Calendar
- Switch between week/month views
- Verify all slots appear on correct dates
- Check that cancelled slots don't appear

#### 4. Test Cancellation
- Cancel a booking (must be >2 hours before session)
- Verify email notifications sent
- Check slot becomes available again

#### 5. Test Security
- Try accessing tutor routes as student (should fail)
- Try accessing student routes as tutor (should fail)
- Test token expiration

### Database Verification

```sql
-- View all users
SELECT id, name, email, role FROM users;

-- View all slots
SELECT id, tutor_id, subject, start_time, status FROM slots;

-- View all bookings
SELECT b.id, u.name as student, s.subject, b.status
FROM bookings b
JOIN users u ON b.student_id = u.id
JOIN slots s ON b.slot_id = s.id;
```

---

## Troubleshooting

### Common Issues

#### Database Connection Error

**Problem:** `Database connection error`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify credentials in .env file
```

#### Port Already in Use

**Problem:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

#### Email Not Sending

**Problem:** Emails not being delivered

**Solution:**
- Verify Gmail App Password (not regular password)
- Enable 2-Factor Authentication on Gmail
- Check SMTP credentials in .env
- Review backend logs for email errors

#### Cannot Login After Registration

**Problem:** Login fails immediately after registration

**Solution:**
- Check browser console for errors (F12)
- Verify token is stored in localStorage
- Check backend logs for authentication errors
- Clear browser cache and try again

#### Slots Not Appearing in Calendar

**Problem:** Created slots don't show in calendar

**Solution:**
- Verify slot start_time is in the future
- Check slot status is 'available'
- Clear browser cache
- Check browser console for API errors

---

## Security

### Implemented Security Measures

#### 1. Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt (10 rounds)
- Session expiration (7 days default)

#### 2. Input Validation
- Express Validator for all inputs
- SQL injection prevention (parameterized queries)
- XSS protection through input sanitization

#### 3. Password Security
- Minimum 6 characters required
- Bcrypt hashing before storage
- Password verification for account deletion

#### 4. API Security
- CORS enabled for trusted origins
- Rate limiting recommended for production
- HTTPS ready (TLS 1.2+)

#### 5. Data Protection
- Sensitive data excluded from API responses
- Cascade delete for user data
- Secure token storage in localStorage

### Security Best Practices for Production

1. Use environment-specific `.env` files
2. Enable HTTPS/TLS
3. Implement rate limiting (express-rate-limit)
4. Add request logging (morgan, winston)
5. Use helmet.js for HTTP headers
6. Implement CSRF protection
7. Regular security audits
8. Keep dependencies updated

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Contributors

### Project Team 4
- Kathit Joshi (PES2UG23CS264)
- Kavyansh Jain (PES2UG23CS268)
- Kavin (PES2UG23CS267)
- Anirudh Kedarisetty (PES2UG23CS271)

### Academic Information
- **Instructor:** Prof. Nandhi Kesavan
- **Institution:** PES University
- **Course:** Software Architecture and Design
- **Date:** September 2025

---

## Acknowledgments

- React team for the excellent frontend library
- Express.js community for the robust backend framework
- PostgreSQL for the reliable database system
- Tailwind CSS for the utility-first styling approach

---

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

---

## Version History

### v1.0.0 (September 2025)
- Initial release
- Core booking functionality
- Calendar integration
- Email notifications
- Account management
