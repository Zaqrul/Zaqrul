const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(requireStaff);

// Get all punchcards
router.get('/', async (req, res) => {
  try {
    const punchcards = await dbAll(`
      SELECT p.*, c.name as customer_name, c.email as customer_email,
             s.name as redeemed_by_name
      FROM punchcards p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN staff s ON p.redeemed_by = s.id
      ORDER BY p.created_at DESC
    `);

    res.json(punchcards);
  } catch (error) {
    console.error('Get punchcards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer's punchcards
router.get('/customer/:customerId', async (req, res) => {
  try {
    const punchcards = await dbAll(
      'SELECT * FROM punchcards WHERE customer_id = ? ORDER BY created_at DESC',
      [req.params.customerId]
    );

    res.json(punchcards);
  } catch (error) {
    console.error('Get customer punchcards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add punch to punchcard
router.post('/punch/:customerId', async (req, res) => {
  try {
    // Get active punchcard
    const punchcard = await dbGet(
      'SELECT * FROM punchcards WHERE customer_id = ? AND is_redeemed = 0 ORDER BY created_at DESC LIMIT 1',
      [req.params.customerId]
    );

    if (!punchcard) {
      // Create new punchcard if none exists
      const result = await dbRun(
        'INSERT INTO punchcards (customer_id, punches, max_punches) VALUES (?, 1, 10)',
        [req.params.customerId]
      );
      return res.json({ message: 'New punchcard created with 1 punch', punchcardId: result.id });
    }

    // Check if punchcard is full
    if (punchcard.punches >= punchcard.max_punches) {
      return res.status(400).json({ error: 'Punchcard is full. Please redeem it first.' });
    }

    // Add punch
    const newPunches = punchcard.punches + 1;
    await dbRun(
      'UPDATE punchcards SET punches = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPunches, punchcard.id]
    );

    res.json({
      message: 'Punch added successfully',
      punches: newPunches,
      remaining: punchcard.max_punches - newPunches,
      isFull: newPunches >= punchcard.max_punches
    });
  } catch (error) {
    console.error('Add punch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redeem punchcard (manual redemption)
router.post('/redeem/:punchcardId', async (req, res) => {
  try {
    const { notes } = req.body;

    // Get punchcard
    const punchcard = await dbGet(
      'SELECT * FROM punchcards WHERE id = ?',
      [req.params.punchcardId]
    );

    if (!punchcard) {
      return res.status(404).json({ error: 'Punchcard not found' });
    }

    if (punchcard.is_redeemed) {
      return res.status(400).json({ error: 'Punchcard already redeemed' });
    }

    if (punchcard.punches < punchcard.max_punches) {
      return res.status(400).json({
        error: `Punchcard is not full. Has ${punchcard.punches}/${punchcard.max_punches} punches.`
      });
    }

    // Mark as redeemed
    await dbRun(
      'UPDATE punchcards SET is_redeemed = 1, redeemed_at = CURRENT_TIMESTAMP, redeemed_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.id, req.params.punchcardId]
    );

    // Create redemption record
    await dbRun(
      'INSERT INTO redemptions (customer_id, punchcard_id, redeemed_by, notes) VALUES (?, ?, ?, ?)',
      [punchcard.customer_id, req.params.punchcardId, req.user.id, notes || null]
    );

    // Create new punchcard for customer
    await dbRun(
      'INSERT INTO punchcards (customer_id, punches, max_punches) VALUES (?, 0, 10)',
      [punchcard.customer_id]
    );

    res.json({
      message: 'Punchcard redeemed successfully. New punchcard created.',
      redeemedBy: req.user.email
    });
  } catch (error) {
    console.error('Redeem punchcard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get redemption history
router.get('/redemptions', async (req, res) => {
  try {
    const redemptions = await dbAll(`
      SELECT r.*, c.name as customer_name, c.email as customer_email,
             s.name as redeemed_by_name, s.email as redeemed_by_email
      FROM redemptions r
      JOIN customers c ON r.customer_id = c.id
      JOIN staff s ON r.redeemed_by = s.id
      ORDER BY r.created_at DESC
    `);

    res.json(redemptions);
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
