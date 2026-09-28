/**
 * MindTrails Contact Form Handler
 * Receives form submissions, validates, and sends emails via SES
 *
 * Deployment: AWS Lambda (Node.js 20.x)
 * Permissions: AmazonSESFullAccess
 * Environment: Set AWS_REGION=eu-central-1
 */

const aws = require('aws-sdk');
const ses = new aws.SES({ region: process.env.AWS_REGION || 'eu-central-1' });

// Allowed origin for CORS
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://mindtrails.net';
const ADMIN_EMAIL = 'daniel@mindtrails.net';
const NOREPLY_EMAIL = 'noreply@mindtrails.net';

// Validation
function validateForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required (min 2 chars)');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.phone || !/^[\d\s()#&+*\-=.]+$/.test(data.phone)) {
    errors.push('Valid phone is required');
  }
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message is required (min 10 chars)');
  }

  return errors;
}

// HTML template for visitor email
function getVisitorEmailHtml(name, message) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Noto Sans', Arial, sans-serif; line-height: 1.6; color: #2C3E50;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #6F5FC1; margin-bottom: 20px;">Thank You, ${name}!</h1>

    <p>We received your inquiry about custom quest experiences.</p>

    <p><strong>What happens next?</strong></p>
    <ul>
      <li>We'll review your message within 24 hours</li>
      <li>Daniel will reach out directly to discuss your project</li>
      <li>We'll tailor an experience that fits your needs perfectly</li>
    </ul>

    <p>In the meantime, feel free to reach out directly:</p>
    <ul style="list-style: none; padding-left: 0;">
      <li>📧 <a href="mailto:daniel@mindtrails.net" style="color: #E95AB2;">daniel@mindtrails.net</a></li>
      <li>📞 +972-538-203-896</li>
    </ul>

    <hr style="border: none; border-top: 2px solid #E95AB2; margin: 30px 0;">

    <p style="color: #999; font-size: 0.9em;">
      MindTrails | Turning knowledge into adventure<br/>
      <a href="https://mindtrails.net" style="color: #E95AB2;">mindtrails.net</a>
    </p>
  </div>
</body>
</html>
  `;
}

// HTML template for admin notification
function getAdminEmailHtml(name, email, phone, message) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Noto Sans', Arial, sans-serif; line-height: 1.6; color: #2C3E50;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #6F5FC1; margin-bottom: 20px;">New Inquiry from ${name}</h1>

    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600; width: 25%;">Name</td>
        <td style="padding: 10px 0;">${name}</td>
      </tr>
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600;">Email</td>
        <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #E95AB2;">${email}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600;">Phone</td>
        <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #E95AB2;">${phone}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Message</td>
        <td style="padding: 10px 0; white-space: pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>

    <hr style="border: none; border-top: 2px solid #E95AB2; margin: 30px 0;">

    <p style="color: #999; font-size: 0.9em;">
      Submitted at ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Main handler
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  // Parse form data (supports application/x-www-form-urlencoded and application/json)
  let data = {};
  try {
    if (event.headers['content-type']?.includes('application/json')) {
      data = JSON.parse(event.body);
    } else if (event.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      // Parse URL-encoded form data
      const params = new URLSearchParams(event.body);
      data = {
        name: params.get('form_fields[name]') || params.get('name'),
        email: params.get('form_fields[email]') || params.get('email'),
        phone: params.get('form_fields[field_7525a0a]') || params.get('phone'),
        message: params.get('form_fields[message]') || params.get('message')
      };
    }
  } catch (err) {
    console.error('Parse error:', err);
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request format' })
    };
  }

  // Validate
  const errors = validateForm(data);
  if (errors.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors })
    };
  }

  try {
    // Send email to visitor
    console.log(`Sending confirmation email to ${data.email}...`);
    await ses.sendEmail({
      Source: NOREPLY_EMAIL,
      Destination: { ToAddresses: [data.email] },
      Message: {
        Subject: { Data: 'Thank you for reaching out - MindTrails' },
        Body: { Html: { Data: getVisitorEmailHtml(data.name, data.message) } }
      }
    }).promise();
    console.log('✓ Visitor email sent');

    // Send copy to admin
    console.log(`Sending admin notification to ${ADMIN_EMAIL}...`);
    await ses.sendEmail({
      Source: NOREPLY_EMAIL,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: `New inquiry from ${data.name}` },
        Body: { Html: { Data: getAdminEmailHtml(data.name, data.email, data.phone, data.message) } }
      }
    }).promise();
    console.log('✓ Admin notification sent');

    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN
      },
      body: JSON.stringify({
        success: true,
        message: 'Thank you! We received your inquiry and will be in touch soon.'
      })
    };

  } catch (error) {
    console.error('SES Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to process inquiry. Please try again later or contact us directly.'
      })
    };
  }
};
