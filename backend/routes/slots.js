const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// Create slot (Tutor only)
router.post('/', [
  auth,
  roleAuth('tutor'),
  body('subject').notEmpty(),
  body('start_time').isISO8601(),
  body('end_time').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, start_time, end_time, capacity } = req.body;
    const tutor_id = req.user.id;

    // Check for overlapping slots
    const overlap = await pool.query(
      `SELECT id FROM slots 
       WHERE tutor_id = $1 
       AND status != 'cancelled'
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [tutor_id, start_time, end_time]
    );

    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'Slot overlaps with existing slot' });
    }

    const result = await pool.query(
      `INSERT INTO slots (tutor_id, subject, description, start_time, end_time, capacity)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tutor_id, subject, description || '', start_time, end_time, capacity || 1]
    );

    console.log('✅ Slot created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

// Get available slots
router.get('/available', auth, async (req, res) => {
  try {
    const { date, subject, tutor_id } = req.query;
    
    let query = `
      SELECT s.*, u.name as tutor_name, u.email as tutor_email
      FROM slots s
      JOIN users u ON s.tutor_id = u.id
      WHERE s.status = 'available'
      AND s.booked_count < s.capacity
      AND s.start_time > NOW()
    `;
    
    const params = [];
    let paramCount = 1;

    if (date) {
      query += ` AND DATE(s.start_time) = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (subject) {
      query += ` AND s.subject ILIKE $${paramCount}`;
      params.push(`%${subject}%`);
      paramCount++;
    }

    if (tutor_id) {
      query += ` AND s.tutor_id = $${paramCount}`;
      params.push(tutor_id);
      paramCount++;
    }

    query += ' ORDER BY s.start_time ASC';

    const result = await pool.query(query, params);
    console.log('📚 Returning', result.rows.length, 'available slots');
    res.json(result.rows);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Get tutor's slots
router.get('/my-slots', auth, roleAuth('tutor'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
        u.name as tutor_name,
        (SELECT string_agg(u2.name, ', ') 
         FROM bookings b 
         JOIN users u2 ON b.student_id = u2.id 
         WHERE b.slot_id = s.id AND b.status = 'confirmed') as student_names
       FROM slots s
       JOIN users u ON s.tutor_id = u.id
       WHERE s.tutor_id = $1
       ORDER BY s.start_time ASC`,
      [req.user.id]
    );
    console.log('📚 Returning', result.rows.length, 'tutor slots');
    res.json(result.rows);
  } catch (error) {
    console.error('Get tutor slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Update slot
router.put('/:id', auth, roleAuth('tutor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, start_time, end_time, capacity, status } = req.body;

    const result = await pool.query(
      `UPDATE slots 
       SET subject = COALESCE($1, subject),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           capacity = COALESCE($5, capacity),
           status = COALESCE($6, status)
       WHERE id = $7 AND tutor_id = $8
       RETURNING *`,
      [subject, description, start_time, end_time, capacity, status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// Delete slot
router.delete('/:id', auth, roleAuth('tutor'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM slots WHERE id = $1 AND tutor_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found or unauthorized' });
    }

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

module.exports = router;