const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(requireStaff);

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await dbAll(`
      SELECT c.*,
             COUNT(p.id) as total_punchcards,
             SUM(CASE WHEN p.is_redeemed = 1 THEN 1 ELSE 0 END) as redeemed_punchcards,
             SUM(CASE WHEN p.is_redeemed = 0 THEN 1 ELSE 0 END) as active_punchcards
      FROM customers c
      LEFT JOIN punchcards p ON c.id = p.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await dbGet(`
      SELECT c.*,
             COUNT(p.id) as total_punchcards,
             SUM(CASE WHEN p.is_redeemed = 1 THEN 1 ELSE 0 END) as redeemed_punchcards
      FROM customers c
      LEFT JOIN punchcards p ON c.id = p.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer's punchcards
    const punchcards = await dbAll(
      'SELECT * FROM punchcards WHERE customer_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ ...customer, punchcards });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await dbRun(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email || null, phone || null]
    );

    // Create initial punchcard
    await dbRun(
      'INSERT INTO punchcards (customer_id, punches, max_punches) VALUES (?, 0, 10)',
      [result.id]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customerId: result.id
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const result = await dbRun(
      'UPDATE customers SET name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email || null, phone || null, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM customers WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const customers = await dbAll(
      'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?',
      [query, query, query]
    );

    res.json(customers);
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
