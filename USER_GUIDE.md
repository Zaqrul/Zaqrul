# Customer Loyalty System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Customers](#managing-customers)
4. [Punchcard System](#punchcard-system)
5. [Manual Redemption](#manual-redemption)
6. [Shopify Integration](#shopify-integration)
7. [Staff Management](#staff-management)
8. [Frequently Asked Questions](#faq)

---

## Getting Started

### First Login

1. Open your web browser and go to `http://localhost:3000`
2. Log in with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. **IMPORTANT**: Change your password immediately after first login

### Changing Your Password

1. Currently, password changes require API access or manager assistance
2. Managers can reset passwords for other staff members
3. Contact your manager if you need a password reset

---

## Dashboard Overview

After logging in, you'll see the main dashboard with several tabs:

### Navigation Tabs
- **Customers** - Manage customer information
- **Punchcards** - View and manage all punchcards
- **Redemptions** - View redemption history
- **Shopify Sync** - Sync customers from Shopify
- **Staff Management** - (Manager only) Manage staff accounts

### Header Information
- Your name and role are displayed in the top-right corner
- Click "Logout" to sign out

---

## Managing Customers

### Viewing Customers

The Customers tab shows all customers in your system with:
- Customer ID
- Name
- Email
- Phone number
- Number of active punchcards
- Action buttons

### Adding a New Customer

1. Click **"Add Customer"** button
2. Fill in the form:
   - **Name** (required)
   - **Email** (optional but recommended)
   - **Phone** (optional)
3. Click **"Add Customer"**
4. A new punchcard is automatically created for the customer

### Searching for Customers

1. Use the search box at the top of the Customers tab
2. Type customer name, email, or phone number
3. Results update automatically as you type

### Viewing Customer Details

1. Click **"View"** button next to any customer
2. A popup shows:
   - Customer information
   - All punchcards (active and redeemed)
   - Redemption options for full punchcards

### Adding a Punch

1. Find the customer in the list
2. Click **"Add Punch"** button
3. Confirm the action
4. The system will:
   - Add a punch to the customer's active punchcard
   - Notify you if the card is now full
   - Create a new card if none exists

---

## Punchcard System

### How Punchcards Work

- Each customer can have multiple punchcards
- Default punchcard has 10 slots
- When a customer makes a purchase, add a punch
- When all 10 punches are filled, the card can be redeemed
- After redemption, a new card is automatically created

### Viewing Punchcards

1. Go to **Punchcards** tab
2. See all punchcards with:
   - Customer name
   - Visual progress (filled dots)
   - Punch count (e.g., 7/10)
   - Status (Active, Full, or Redeemed)

### Punchcard Status

- **Active** (Green badge) - Card has room for more punches
- **Full** (Orange badge) - Card is complete, ready for redemption
- **Redeemed** (Gray badge) - Card has been redeemed

---

## Manual Redemption

### When to Redeem

Redeem a punchcard when:
- The card shows 10/10 punches
- The status shows "Full"
- Customer requests their reward

### How to Redeem

#### Method 1: From Customer View
1. Click **"View"** on a customer
2. Find the full punchcard in the list
3. Click **"Redeem"** button
4. Add optional notes (e.g., "Free coffee - medium latte")
5. Click **"Confirm Redemption"**

#### Method 2: From Punchcards Tab
1. Go to **Punchcards** tab
2. Find the full punchcard
3. Click **"Redeem"** button
4. Add optional notes
5. Click **"Confirm Redemption"**

### What Happens After Redemption

1. The punchcard is marked as redeemed
2. A redemption record is created
3. A new empty punchcard is created for the customer
4. The redemption appears in the Redemptions history

### Viewing Redemption History

1. Go to **Redemptions** tab
2. See all redemptions with:
   - Customer name
   - Staff member who processed it
   - Date and time
   - Any notes added

---

## Shopify Integration

### Overview

If your business uses Shopify, you can sync customer data automatically.

### Syncing All Customers

1. Go to **Shopify Sync** tab
2. Click **"Sync All Customers"**
3. Confirm the action
4. Wait for the sync to complete
5. Results show:
   - Total customers synced
   - New customers created
   - Existing customers updated

### Searching Shopify Customers

1. Go to **Shopify Sync** tab
2. Enter customer name or email in search box
3. Click **"Search"**
4. Results show Shopify customers
5. Click **"Sync"** on individual customers to import them

### What Gets Synced

From Shopify, the system imports:
- Customer name
- Email address
- Phone number
- Total orders
- Total amount spent

---

## Staff Management

*(Manager role only)*

### Viewing Staff

1. Go to **Staff Management** tab
2. See all staff members with:
   - Name
   - Email
   - Role (Staff or Manager)

### Adding New Staff

1. Click **"Add Staff"** button
2. Fill in the form:
   - **Name** (required)
   - **Email** (required)
   - **Password** (required)
   - **Role** (Staff or Manager)
3. Click **"Add Staff"**
4. New staff member can now log in

### Staff Roles

**Staff**:
- Manage customers
- Add punches
- Redeem punchcards
- View history
- Sync Shopify

**Manager**:
- All staff permissions
- Create/delete staff accounts
- Reset passwords
- Full system access

### Deleting Staff

1. Go to **Staff Management** tab
2. Click **"Delete"** next to staff member
3. Confirm the action
4. Note: You cannot delete your own account

---

## Frequently Asked Questions

### Q: What if a customer loses their punchcard?

A: All punchcards are digital and stored in the system. Simply search for the customer by name, email, or phone to see their active punchcards.

### Q: Can I add multiple punches at once?

A: Currently, you need to click "Add Punch" for each purchase. This ensures accuracy.

### Q: What happens if I accidentally add a punch?

A: Contact your manager. Managers can access the database to make corrections if needed.

### Q: Can customers redeem partial cards?

A: No, a punchcard must be completely full (10/10 punches) before it can be redeemed.

### Q: How do I know when a customer's card is full?

A: Full cards show an orange "Full" badge and display 10/10 punches. You can also filter to see only full cards in the Punchcards tab.

### Q: What if Shopify sync doesn't work?

A: Check that:
- Shopify credentials are configured in .env file
- Your Shopify API token is valid
- Internet connection is working
- Contact your system administrator if issues persist

### Q: Can customers see their own punchcards?

A: This version is staff-only. Customer self-service can be added in future versions.

### Q: How are social media engagements tracked?

A: When customers like, comment, or share on social media (configured with webhooks), the system automatically sends them a thank you email.

### Q: What email notifications are sent?

A: Currently, thank you emails are sent when customers engage on social media (like, comment, share). Email configuration is required in the .env file.

### Q: How do I backup customer data?

A: The system uses a SQLite database file (database.db). Ask your administrator to make regular backups of this file.

### Q: Can I customize the number of punches required?

A: Currently set to 10 punches per card. This can be modified by a developer in the database schema.

---

## Best Practices

### Daily Operations

1. **Start of shift**: Log in and verify system is working
2. **Customer purchase**: Add punch immediately
3. **Full card**: Offer redemption opportunity
4. **End of shift**: Log out

### Customer Service

1. **Be friendly**: Explain the punchcard program to new customers
2. **Be accurate**: Double-check before adding punches
3. **Be helpful**: Show customers their progress when asked
4. **Be consistent**: Ensure all eligible purchases get punches

### Data Management

1. **Keep emails updated**: Accurate emails enable better communication
2. **Add phone numbers**: Helps identify customers without email
3. **Use notes**: Add redemption notes for tracking preferences
4. **Regular syncs**: If using Shopify, sync regularly to keep data current

---

## Troubleshooting

### Can't Log In
- Verify email and password are correct
- Check with manager if password reset is needed
- Clear browser cache and try again

### Customer Not Found
- Try different search terms (name, email, phone)
- Check spelling
- Customer might not be in system yet - add them

### Punchcard Issues
- Refresh the page
- Log out and log back in
- Contact manager if problem persists

### Slow Performance
- Check internet connection
- Close other browser tabs
- Refresh the page
- Report to system administrator

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check INSTALLATION.md** for technical setup issues
2. **Contact your manager** for operational questions
3. **Contact system administrator** for technical problems
4. **Submit an issue** on the project repository

---

## Tips for Success

1. **Learn the shortcuts**: Get familiar with keyboard navigation
2. **Search efficiently**: Use specific search terms
3. **Keep data clean**: Update customer info when they provide it
4. **Check daily**: Review redemptions to track popular rewards
5. **Be proactive**: Remind customers about their progress

---

**Remember**: The system is designed to be simple and user-friendly. With practice, you'll be managing customers and punchcards efficiently in no time!
