const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

db.serialize(() => {
  // Create staff table
  db.run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('staff', 'manager')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating staff table:', err);
    else console.log('✓ Staff table created');
  });

  // Create customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      shopify_customer_id TEXT UNIQUE,
      total_purchases INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating customers table:', err);
    else console.log('✓ Customers table created');
  });

  // Create punchcards table
  db.run(`
    CREATE TABLE IF NOT EXISTS punchcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      punches INTEGER DEFAULT 0,
      max_punches INTEGER DEFAULT 10,
      is_redeemed INTEGER DEFAULT 0,
      redeemed_at DATETIME,
      redeemed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (redeemed_by) REFERENCES staff(id)
    )
  `, (err) => {
    if (err) console.error('Error creating punchcards table:', err);
    else console.log('✓ Punchcards table created');
  });

  // Create redemptions history table
  db.run(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      punchcard_id INTEGER NOT NULL,
      redeemed_by INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (punchcard_id) REFERENCES punchcards(id),
      FOREIGN KEY (redeemed_by) REFERENCES staff(id)
    )
  `, (err) => {
    if (err) console.error('Error creating redemptions table:', err);
    else console.log('✓ Redemptions table created');
  });

  // Create social media engagement table
  db.run(`
    CREATE TABLE IF NOT EXISTS social_engagement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_email TEXT,
      platform TEXT NOT NULL,
      engagement_type TEXT NOT NULL CHECK(engagement_type IN ('like', 'comment', 'share')),
      content TEXT,
      email_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `, (err) => {
    if (err) console.error('Error creating social_engagement table:', err);
    else console.log('✓ Social engagement table created');
  });

  // Create default admin account
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }

    db.run(`
      INSERT OR IGNORE INTO staff (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `, [adminEmail, hash, 'Administrator', 'manager'], (err) => {
      if (err) console.error('Error creating admin account:', err);
      else console.log('✓ Default admin account created');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('\n⚠️  Please change the default password after first login!');
    });
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\n✓ Database initialization complete!');
  }
});
