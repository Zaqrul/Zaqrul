const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check if user is a manager
const requireManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied. Manager role required.' });
  }
  next();
};

// Middleware to check if user is staff or manager
const requireStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied. Staff role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireManager,
  requireStaff
};
