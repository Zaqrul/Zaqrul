const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/punchcards', require('./routes/punchcards'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/shopify', require('./routes/shopify'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Customer Loyalty & Punchcard Management System         ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║                                                           ║
║   Dashboard: http://localhost:${PORT}/dashboard            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  console.log('✓ Server started successfully');
  console.log('✓ Database connected');
  console.log('\nReady to accept connections...\n');
});

module.exports = app;
