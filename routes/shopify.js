const express = require('express');
const router = express.Router();
const axios = require('axios');
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(requireStaff);

// Shopify API configuration
const getShopifyConfig = () => {
  return {
    baseURL: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/${process.env.SHOPIFY_API_VERSION}`,
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  };
};

// Sync customer from Shopify
router.post('/sync-customer/:shopifyCustomerId', async (req, res) => {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Shopify API not configured' });
    }

    const config = getShopifyConfig();

    // Fetch customer from Shopify
    const response = await axios.get(
      `${config.baseURL}/customers/${req.params.shopifyCustomerId}.json`,
      { headers: config.headers }
    );

    const shopifyCustomer = response.data.customer;

    // Check if customer already exists
    const existingCustomer = await dbGet(
      'SELECT * FROM customers WHERE shopify_customer_id = ?',
      [shopifyCustomer.id.toString()]
    );

    if (existingCustomer) {
      // Update existing customer
      await dbRun(
        `UPDATE customers SET
         name = ?,
         email = ?,
         phone = ?,
         total_purchases = ?,
         total_spent = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
          shopifyCustomer.email,
          shopifyCustomer.phone,
          shopifyCustomer.orders_count || 0,
          parseFloat(shopifyCustomer.total_spent || 0),
          existingCustomer.id
        ]
      );

      res.json({
        message: 'Customer updated from Shopify',
        customerId: existingCustomer.id
      });
    } else {
      // Create new customer
      const result = await dbRun(
        `INSERT INTO customers
         (name, email, phone, shopify_customer_id, total_purchases, total_spent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
          shopifyCustomer.email,
          shopifyCustomer.phone,
          shopifyCustomer.id.toString(),
          shopifyCustomer.orders_count || 0,
          parseFloat(shopifyCustomer.total_spent || 0)
        ]
      );

      // Create initial punchcard
      await dbRun(
        'INSERT INTO punchcards (customer_id, punches, max_punches) VALUES (?, 0, 10)',
        [result.id]
      );

      res.json({
        message: 'Customer synced from Shopify',
        customerId: result.id
      });
    }
  } catch (error) {
    console.error('Sync customer error:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Shopify API error',
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync all customers from Shopify
router.post('/sync-all-customers', async (req, res) => {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Shopify API not configured' });
    }

    const config = getShopifyConfig();

    // Fetch all customers from Shopify (with pagination if needed)
    const response = await axios.get(
      `${config.baseURL}/customers.json?limit=250`,
      { headers: config.headers }
    );

    const customers = response.data.customers;
    let synced = 0;
    let updated = 0;
    let created = 0;

    for (const shopifyCustomer of customers) {
      const existingCustomer = await dbGet(
        'SELECT * FROM customers WHERE shopify_customer_id = ?',
        [shopifyCustomer.id.toString()]
      );

      if (existingCustomer) {
        await dbRun(
          `UPDATE customers SET
           name = ?,
           email = ?,
           phone = ?,
           total_purchases = ?,
           total_spent = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
            shopifyCustomer.email,
            shopifyCustomer.phone,
            shopifyCustomer.orders_count || 0,
            parseFloat(shopifyCustomer.total_spent || 0),
            existingCustomer.id
          ]
        );
        updated++;
      } else {
        const result = await dbRun(
          `INSERT INTO customers
           (name, email, phone, shopify_customer_id, total_purchases, total_spent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
            shopifyCustomer.email,
            shopifyCustomer.phone,
            shopifyCustomer.id.toString(),
            shopifyCustomer.orders_count || 0,
            parseFloat(shopifyCustomer.total_spent || 0)
          ]
        );

        // Create initial punchcard
        await dbRun(
          'INSERT INTO punchcards (customer_id, punches, max_punches) VALUES (?, 0, 10)',
          [result.id]
        );
        created++;
      }
      synced++;
    }

    res.json({
      message: 'Customers synced from Shopify',
      total: synced,
      created,
      updated
    });
  } catch (error) {
    console.error('Sync all customers error:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Shopify API error',
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search Shopify customers
router.get('/search/:query', async (req, res) => {
  try {
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Shopify API not configured' });
    }

    const config = getShopifyConfig();

    const response = await axios.get(
      `${config.baseURL}/customers/search.json?query=${encodeURIComponent(req.params.query)}`,
      { headers: config.headers }
    );

    res.json(response.data.customers);
  } catch (error) {
    console.error('Search Shopify customers error:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Shopify API error',
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
