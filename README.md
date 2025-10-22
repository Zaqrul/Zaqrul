# Customer Loyalty & Punchcard Management System

A simple, complete customer loyalty system with digital punchcards, Shopify integration, and social media engagement tracking. Built with Node.js and local SQLite database.

## Features

### Core Functionality
- **Digital Punchcard System** - Track customer purchases with digital punchcards
- **Manual Redemption Dashboard** - Staff can manually redeem completed punchcards
- **Customer Management** - Add, view, and manage customer details
- **Staff Account System** - Role-based access for staff and managers

### Integrations
- **Shopify API Integration** - Sync customer data from Shopify store
- **Auto Email Notifications** - Send thank you emails when customers engage on social media
- **Social Media Webhooks** - Track likes, comments, and shares

### Key Benefits
- Simple and user-friendly interface (no React, pure HTML/CSS/JS)
- Local database (SQLite) - no cloud setup required
- Role-based access control - only staff and managers can log in
- Complete system ready to deploy in under a month

## Quick Start

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Zaqrul
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Initialize database**
```bash
npm run init-db
```

5. **Start the server**
```bash
npm start
```

6. **Open in browser**
```
http://localhost:3000
```

### Default Login
- Email: `admin@example.com`
- Password: `admin123`

**Change the default password immediately after first login!**

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (local database)
- **Frontend**: HTML, CSS, JavaScript (no frameworks)
- **Authentication**: JWT with role-based access
- **Email**: Nodemailer
- **API Integration**: Shopify API, Axios

## System Requirements

- Node.js v14 or higher
- npm or yarn
- (Optional) Shopify store for integration
- (Optional) SMTP email account for notifications

## Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation and setup guide
- **[USER_GUIDE.md](USER_GUIDE.md)** - User manual for staff and managers

## Project Structure

```
Zaqrul/
├── config/           # Database configuration
├── middleware/       # Authentication middleware
├── models/           # Data models (if needed)
├── routes/           # API routes
│   ├── auth.js       # Authentication endpoints
│   ├── customers.js  # Customer management
│   ├── punchcards.js # Punchcard operations
│   ├── staff.js      # Staff management
│   ├── shopify.js    # Shopify integration
│   └── webhooks.js   # Social media webhooks
├── scripts/          # Database initialization
├── services/         # Email service
├── public/           # Frontend files
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   ├── login.html    # Login page
│   └── dashboard.html # Main dashboard
├── server.js         # Main server file
├── package.json      # Dependencies
└── .env.example      # Environment variables template
```

## Key Features Explained

### 1. Punchcard System
- Customers receive digital punchcards
- Staff add punches for each purchase
- Default: 10 punches per card
- Automatic new card creation after redemption

### 2. Manual Redemption
- Staff can redeem full punchcards via dashboard
- Add optional notes (e.g., "Free coffee")
- Complete redemption history tracking
- Automatic new card generation

### 3. Shopify Integration
- Sync individual or all customers from Shopify
- Import customer names, emails, phone numbers
- Track purchase history from Shopify
- Search Shopify customers directly

### 4. Social Media Engagement
- Webhook endpoint for social platforms
- Auto-send thank you emails for likes/comments/shares
- Track all engagement in database
- Customizable email templates

### 5. Staff Management
- Two roles: Staff and Manager
- Staff: Manage customers and punchcards
- Manager: All staff permissions + staff account management
- Secure authentication with JWT

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Punchcards
- `POST /api/punchcards/punch/:customerId` - Add punch
- `POST /api/punchcards/redeem/:punchcardId` - Redeem card
- `GET /api/punchcards/redemptions` - Redemption history

### Shopify
- `POST /api/shopify/sync-all-customers` - Sync all
- `POST /api/shopify/sync-customer/:id` - Sync one

### Webhooks
- `POST /api/webhooks/social-engagement` - Social media events

## Configuration

### Environment Variables

Required:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `DEFAULT_ADMIN_EMAIL` - Admin email
- `DEFAULT_ADMIN_PASSWORD` - Admin password

Optional (for email):
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password

Optional (for Shopify):
- `SHOPIFY_STORE_URL` - Your store URL
- `SHOPIFY_ACCESS_TOKEN` - API access token
- `SHOPIFY_API_VERSION` - API version

## Security

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- HTTP-only cookies
- Environment variable protection
- Input validation

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
# Or use PM2 for process management
pm2 start server.js --name loyalty-system
```

## License

MIT

## Support

For issues, questions, or contributions, please refer to the documentation or contact the development team.

## Credits

Developed by @Zaqrul
