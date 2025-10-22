const nodemailer = require('nodemailer');

// Create email transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

// Send email function
async function sendEmail(to, subject, htmlContent) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.warn('Email not configured. Skipping email send.');
      return { success: false, error: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await getTransporter().sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send bulk emails
async function sendBulkEmails(recipients, subject, htmlContent) {
  const results = [];

  for (const recipient of recipients) {
    try {
      const result = await sendEmail(recipient, subject, htmlContent);
      results.push({ email: recipient, success: true, ...result });
    } catch (error) {
      results.push({ email: recipient, success: false, error: error.message });
    }
  }

  return results;
}

module.exports = {
  sendEmail,
  sendBulkEmails
};
