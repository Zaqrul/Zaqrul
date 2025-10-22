const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../config/database');
const { sendEmail } = require('../services/email');

// Webhook for social media engagement (like, comment, share)
// This endpoint receives data from social media platforms
router.post('/social-engagement', async (req, res) => {
  try {
    const { platform, engagementType, customerEmail, customerName, content, webhookSecret } = req.body;

    // Verify webhook secret
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    if (!platform || !engagementType) {
      return res.status(400).json({ error: 'Platform and engagement type are required' });
    }

    if (!['like', 'comment', 'share'].includes(engagementType)) {
      return res.status(400).json({ error: 'Invalid engagement type' });
    }

    // Find customer by email if provided
    let customerId = null;
    if (customerEmail) {
      const customer = await dbGet(
        'SELECT id FROM customers WHERE email = ?',
        [customerEmail]
      );
      customerId = customer ? customer.id : null;
    }

    // Record engagement
    const result = await dbRun(
      `INSERT INTO social_engagement
       (customer_id, customer_email, platform, engagement_type, content, email_sent)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [customerId, customerEmail || null, platform, engagementType, content || null]
    );

    // Send thank you email
    if (customerEmail) {
      try {
        const emailSubject = `Thank you for your ${engagementType} on ${platform}!`;
        const emailBody = generateThankYouEmail(customerName || 'Valued Customer', engagementType, platform);

        await sendEmail(customerEmail, emailSubject, emailBody);

        // Mark email as sent
        await dbRun(
          'UPDATE social_engagement SET email_sent = 1 WHERE id = ?',
          [result.id]
        );

        res.json({
          message: 'Engagement recorded and email sent',
          engagementId: result.id
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        res.json({
          message: 'Engagement recorded but email failed to send',
          engagementId: result.id,
          emailError: emailError.message
        });
      }
    } else {
      res.json({
        message: 'Engagement recorded (no email available)',
        engagementId: result.id
      });
    }
  } catch (error) {
    console.error('Social engagement webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test webhook endpoint
router.post('/test', (req, res) => {
  console.log('Test webhook received:', req.body);
  res.json({ message: 'Test webhook received successfully', data: req.body });
});

// Generate thank you email content
function generateThankYouEmail(customerName, engagementType, platform) {
  const messages = {
    like: `We noticed you liked our content on ${platform}! Thank you for your support.`,
    comment: `Thank you for commenting on our ${platform} post! We appreciate your engagement.`,
    share: `Wow! Thank you for sharing our content on ${platform}! Your support means the world to us.`
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Hi ${customerName},</h2>
      <p style="font-size: 16px; color: #555;">
        ${messages[engagementType] || 'Thank you for engaging with us on social media!'}
      </p>
      <p style="font-size: 16px; color: #555;">
        As a token of our appreciation, don't forget to ask about our loyalty punchcard
        program on your next visit!
      </p>
      <p style="font-size: 16px; color: #555;">
        We look forward to seeing you soon!
      </p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 14px; color: #999; text-align: center;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
}

module.exports = router;
