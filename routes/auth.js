const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find staff member
    const staff = await dbGet('SELECT * FROM staff WHERE email = ?', [email]);

    if (!staff) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, staff.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      sameSite: 'strict'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const staff = await dbGet(
      'SELECT id, email, name, role, created_at FROM staff WHERE id = ?',
      [req.user.id]
    );

    if (!staff) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // Get current user
    const staff = await dbGet('SELECT * FROM staff WHERE id = ?', [req.user.id]);

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, staff.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await dbRun(
      'UPDATE staff SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
