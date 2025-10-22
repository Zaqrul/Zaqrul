# Customer Loyalty System - Installation Guide

## Overview
This is a simple customer loyalty and punchcard management system with Shopify integration, built with Node.js and SQLite.

## Requirements
- Node.js (v14 or higher)
- npm or yarn
- A Shopify store (optional, for integration)
- Email account for SMTP (optional, for notifications)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and edit it:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (Change this!)
JWT_SECRET=your-random-secret-key-here

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Shopify API Configuration (optional)
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
SHOPIFY_API_VERSION=2024-01

# Social Media Webhook Secret
WEBHOOK_SECRET=your-webhook-secret

# Default Admin Account
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### 3. Initialize Database
```bash
npm run init-db
```

This will:
- Create the SQLite database
- Set up all necessary tables
- Create a default admin account

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000

## Default Login Credentials
- **Email**: admin@example.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## Features

### 1. Customer Management
- Add, view, and manage customer details
- Search customers by name, email, or phone
- Track customer purchase history

### 2. Punchcard System
- Create and manage digital punchcards
- Add punches manually via dashboard
- Track active and redeemed punchcards
- Automatic new card creation after redemption

### 3. Manual Redemption (Dashboard)
- Staff can manually redeem full punchcards
- Add optional notes to redemptions
- View redemption history

### 4. Staff Account Management
- Role-based access (Staff and Manager)
- Managers can create and manage staff accounts
- Staff can manage customers and punchcards
- Only staff and managers can log into the system

### 5. Shopify Integration
- Sync individual customers from Shopify
- Bulk sync all Shopify customers
- Search Shopify customers
- Automatic punchcard creation for new customers

### 6. Social Media Engagement
- Webhook endpoint for social media events
- Auto-send thank you emails when customers like/comment/share
- Track engagement history

## Using Shopify Integration

### Setting Up Shopify API

1. Go to your Shopify Admin
2. Navigate to Settings > Apps and sales channels > Develop apps
3. Create a new app
4. Configure Admin API scopes: `read_customers`, `write_customers`
5. Install the app and get the Access Token
6. Add credentials to `.env` file

### Syncing Customers

Option 1: Sync all customers
```
Dashboard > Shopify Sync > Sync All Customers
```

Option 2: Search and sync individual customers
```
Dashboard > Shopify Sync > Search > Select customer > Sync
```

## Social Media Webhook Setup

The system provides a webhook endpoint for social media engagement:

**Endpoint**: `POST /api/webhooks/social-engagement`

**Required fields**:
```json
{
  "platform": "facebook|instagram|twitter",
  "engagementType": "like|comment|share",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "content": "Optional content text",
  "webhookSecret": "your-webhook-secret"
}
```

When a webhook is received:
1. Engagement is recorded in the database
2. A thank you email is automatically sent to the customer
3. The email template varies based on engagement type

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (Account Settings > Security > App Passwords)
3. Use the app password in the `.env` file

### Other Email Providers
Update `EMAIL_HOST` and `EMAIL_PORT` in `.env`:
- Gmail: smtp.gmail.com:587
- Outlook: smtp-mail.outlook.com:587
- SendGrid: smtp.sendgrid.net:587
- Custom SMTP: your-smtp-server.com:587

## User Roles

### Staff
- View and manage customers
- Add punches to punchcards
- Redeem full punchcards
- View redemption history
- Sync with Shopify

### Manager
- All staff permissions
- Create and manage staff accounts
- Delete staff members
- Full system access

## Database Structure

The system uses SQLite with the following tables:
- `staff` - Staff accounts with role-based access
- `customers` - Customer information
- `punchcards` - Digital punchcards for customers
- `redemptions` - History of redeemed punchcards
- `social_engagement` - Social media engagement tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/search/:query` - Search customers

### Punchcards
- `GET /api/punchcards` - List all punchcards
- `GET /api/punchcards/customer/:id` - Get customer punchcards
- `POST /api/punchcards/punch/:customerId` - Add punch
- `POST /api/punchcards/redeem/:punchcardId` - Redeem punchcard
- `GET /api/punchcards/redemptions` - Get redemption history

### Staff (Manager only)
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `POST /api/staff/:id/reset-password` - Reset password

### Shopify
- `POST /api/shopify/sync-customer/:id` - Sync single customer
- `POST /api/shopify/sync-all-customers` - Sync all customers
- `GET /api/shopify/search/:query` - Search Shopify customers

### Webhooks
- `POST /api/webhooks/social-engagement` - Social media engagement
- `POST /api/webhooks/test` - Test webhook

## Troubleshooting

### Database Issues
If you encounter database errors, reinitialize:
```bash
rm database.db
npm run init-db
```

### Port Already in Use
Change the PORT in `.env` file:
```
PORT=3001
```

### Email Not Sending
- Verify SMTP credentials
- Check firewall settings
- For Gmail, ensure app password is used (not regular password)
- Check spam folder

### Shopify Connection Failed
- Verify store URL format: `your-store.myshopify.com`
- Check access token is valid
- Ensure API scopes are correct

## Security Notes

1. **Change default admin password** immediately
2. **Use strong JWT_SECRET** (random string, 32+ characters)
3. **Keep .env file secure** (never commit to git)
4. **Use HTTPS** in production
5. **Regular backups** of database.db file

## Backup

To backup your data:
```bash
# Copy the database file
cp database.db database.backup.db
```

To restore:
```bash
cp database.backup.db database.db
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager (PM2 recommended):
```bash
npm install -g pm2
pm2 start server.js --name loyalty-system
pm2 save
pm2 startup
```

3. Use nginx as reverse proxy
4. Enable SSL/HTTPS
5. Set up automated backups

## Support

For issues or questions, refer to the project documentation or contact support.
