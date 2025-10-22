const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { dbAll, dbGet, dbRun } = require('../config/database');
const { authenticateToken, requireManager } = require('../middleware/auth');

// All routes require authentication and manager role
router.use(authenticateToken);
router.use(requireManager);

// Get all staff members
router.get('/', async (req, res) => {
  try {
    const staff = await dbAll(
      'SELECT id, email, name, role, created_at, updated_at FROM staff ORDER BY created_at DESC'
    );

    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new staff member
router.post('/', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['staff', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "staff" or "manager"' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbRun(
      'INSERT INTO staff (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    res.status(201).json({
      message: 'Staff member created successfully',
      staffId: result.id
    });
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff member
router.put('/:id', async (req, res) => {
  try {
    const { name, role } = req.body;

    const result = await dbRun(
      'UPDATE staff SET name = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, role, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await dbRun('DELETE FROM staff WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset staff password (manager only)
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await dbRun(
      'UPDATE staff SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
