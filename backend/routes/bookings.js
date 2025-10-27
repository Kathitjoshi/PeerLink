const express = require('express');
const pool = require('../config/database');
const { auth, roleAuth } = require('../middleware/auth');
const { sendBookingConfirmation, sendCancellationNotification } = require('../services/emailService');

const router = express.Router();

// Create booking
router.post('/', auth, roleAuth('student'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { slot_id } = req.body;
    const student_id = req.user.id;

    // Check if slot exists and is available
    const slotResult = await client.query(
      `SELECT s.*, u.name as tutor_name, u.email as tutor_email
       FROM slots s
       JOIN users u ON s.tutor_id = u.id
       WHERE s.id = $1 AND s.status = 'available' 
       AND s.booked_count < s.capacity
       AND s.start_time > NOW()
       FOR UPDATE`,
      [slot_id]
    );

    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Slot not available' });
    }

    const slot = slotResult.rows[0];

    // Check for student's overlapping bookings
    const overlapCheck = await client.query(
      `SELECT b.id FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE b.student_id = $1 
       AND b.status = 'confirmed'
       AND (
         (s.start_time <= $2 AND s.end_time > $2) OR
         (s.start_time < $3 AND s.end_time >= $3) OR
         (s.start_time >= $2 AND s.end_time <= $3)
       )`,
      [student_id, slot.start_time, slot.end_time]
    );

    if (overlapCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You have an overlapping booking' });
    }

    // Check if already booked
    const existingBooking = await client.query(
      'SELECT id FROM bookings WHERE slot_id = $1 AND student_id = $2',
      [slot_id, student_id]
    );

    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already booked this slot' });
    }

    // Create booking
    const bookingResult = await client.query(
      'INSERT INTO bookings (slot_id, student_id, status) VALUES ($1, $2, $3) RETURNING *',
      [slot_id, student_id, 'confirmed']
    );

    // Update slot booked count
    await client.query(
      `UPDATE slots 
       SET booked_count = booked_count + 1,
           status = CASE WHEN booked_count + 1 >= capacity THEN 'booked' ELSE 'available' END
       WHERE id = $1`,
      [slot_id]
    );

    // Get student email
    const studentResult = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [student_id]
    );

    await client.query('COMMIT');

    // Send confirmation emails
    await sendBookingConfirmation(
      studentResult.rows[0].email,
      slot.tutor_email,
      slot
    );

    res.status(201).json(bookingResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Get student's bookings
router.get('/my-bookings', auth, roleAuth('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.subject, s.description, s.start_time, s.end_time,
              u.name as tutor_name, u.email as tutor_email
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN users u ON s.tutor_id = u.id
       WHERE b.student_id = $1
       ORDER BY s.start_time DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel booking
// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const user_id = req.user.id;

    // Get booking details
    const bookingResult = await client.query(
      `SELECT b.*, s.*, u.email as student_email, tu.email as tutor_email
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN users u ON b.student_id = u.id
       JOIN users tu ON s.tutor_id = tu.id
       WHERE b.id = $1
       FOR UPDATE`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check authorization
    if (booking.student_id !== user_id && booking.tutor_id !== user_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check cancellation policy (2 hours before)
    const hoursUntilSession = (new Date(booking.start_time) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilSession < 2) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot cancel within 2 hours of session' });
    }

    // Cancel booking
    await client.query(
      'UPDATE bookings SET status = $1, cancelled_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );

    // Update slot - CHECK IF ALL BOOKINGS ARE CANCELLED
    const remainingBookings = await client.query(
      'SELECT COUNT(*) as count FROM bookings WHERE slot_id = $1 AND status = $2',
      [booking.slot_id, 'confirmed']
    );

    const confirmedCount = parseInt(remainingBookings.rows[0].count);

    // If no confirmed bookings remain, mark slot as cancelled
    if (confirmedCount === 0) {
      await client.query(
        `UPDATE slots 
         SET booked_count = 0,
             status = 'cancelled'
         WHERE id = $1`,
        [booking.slot_id]
      );
    } else {
      // Otherwise just decrease count
      await client.query(
        `UPDATE slots 
         SET booked_count = booked_count - 1,
             status = 'available'
         WHERE id = $1`,
        [booking.slot_id]
      );
    }

    await client.query('COMMIT');

    // Send cancellation emails
    await sendCancellationNotification(booking.student_email, booking, false);
    await sendCancellationNotification(booking.tutor_email, booking, true);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    client.release();
  }
});

module.exports = router;