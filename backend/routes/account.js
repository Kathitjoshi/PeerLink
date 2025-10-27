const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Delete account
router.delete('/delete', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const { password } = req.body;

    // Verify password before deletion
    const userResult = await client.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, userResult.rows[0].password);
    
    if (!isMatch) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user (CASCADE will delete slots, bookings, notifications)
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    console.log(`🗑️  Account deleted: User ID ${userId}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  } finally {
    client.release();
  }
});

module.exports = router;