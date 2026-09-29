/**
 * MindTrails Contact Form Handler
 * Receives form submissions, validates, and sends emails via SES
 *
 * Deployment: AWS Lambda (Node.js 20.x)
 * Permissions: AmazonSESFullAccess
 * Environment: Set AWS_REGION=eu-central-1
 */

const aws = require('aws-sdk');

// Environment variables (set via CloudFormation/Lambda env vars)
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://mindtrails.net';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'daniel@mindtrails.net';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'noreply@mindtrails.net';
const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE || 'mindtrails-submission-log-prod';
const RATE_LIMIT_PERIOD = parseInt(process.env.RATE_LIMIT_PERIOD || '3600'); // 1 hour default

const ses = new aws.SES({ region: AWS_REGION });
const dynamodb = new aws.DynamoDB({ region: AWS_REGION });

// Request validation (Layer 3: Security checks)
function validateRequest(event) {
  // Check Content-Type
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('application/json')) {
    console.warn('Invalid Content-Type:', contentType);
    return { valid: false, error: 'Invalid Content-Type' };
  }

  // Check Referer (Layer 3 security)
  const referer = event.headers['referer'] || event.headers['Referer'] || '';
  if (referer && !referer.includes('mindtrails.net')) {
    console.warn('Invalid referer:', referer);
    return { valid: false, error: 'Invalid origin' };
  }

  return { valid: true };
}

// Check rate limit from DynamoDB
async function checkRateLimit(email) {
  try {
    const result = await dynamodb.getItem({
      TableName: RATE_LIMIT_TABLE,
      Key: {
        email: { S: email }
      }
    }).promise();

    if (!result.Item) {
      return { rateLimited: false, lastSubmissionTime: null };
    }

    const lastSubmissionTime = parseInt(result.Item.lastSentTime.N);
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastSubmission = now - lastSubmissionTime;

    if (timeSinceLastSubmission < RATE_LIMIT_PERIOD) {
      return {
        rateLimited: true,
        lastSubmissionTime,
        timeSinceLastSubmission,
        nextEligibleTime: lastSubmissionTime + RATE_LIMIT_PERIOD
      };
    }

    return { rateLimited: false, lastSubmissionTime };
  } catch (err) {
    console.error('DynamoDB getItem error:', err);
    throw new Error('Failed to check rate limit');
  }
}

// Update rate limit in DynamoDB
async function updateRateLimit(email) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = now + 86400; // 24 hour TTL

    await dynamodb.updateItem({
      TableName: RATE_LIMIT_TABLE,
      Key: {
        email: { S: email }
      },
      UpdateExpression: 'SET lastSentTime = :now, submissionCount = if_not_exists(submissionCount, :zero) + :one, expirationTime = :ttl',
      ExpressionAttributeValues: {
        ':now': { N: now.toString() },
        ':one': { N: '1' },
        ':zero': { N: '0' },
        ':ttl': { N: expirationTime.toString() }
      }
    }).promise();

    console.log(`Rate limit updated for ${email}`);
  } catch (err) {
    console.error('DynamoDB updateItem error:', err);
    throw new Error('Failed to update rate limit');
  }
}

// Send rate limit violation alert to admin
async function sendRateLimitAlert(email, name, timeSinceLastSubmission) {
  const periodLabel = RATE_LIMIT_PERIOD === 3600 ? 'hour' : `${RATE_LIMIT_PERIOD} seconds`;
  const minutesSince = Math.floor(timeSinceLastSubmission / 60);

  const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Noto Sans', Arial, sans-serif; line-height: 1.6; color: #2C3E50;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #E95AB2; margin-bottom: 20px;">⚠️ Rate Limit Alert</h1>

    <p><strong>${name}</strong> attempted to submit the contact form too quickly.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600; width: 25%;">Email</td>
        <td style="padding: 10px 0;">${escapeHtml(email)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600;">Name</td>
        <td style="padding: 10px 0;">${escapeHtml(name)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600;">Time Since Last Submission</td>
        <td style="padding: 10px 0;">${minutesSince} minute(s)</td>
      </tr>
      <tr style="border-bottom: 1px solid #E0E0E0;">
        <td style="padding: 10px 0; font-weight: 600;">Rate Limit Period</td>
        <td style="padding: 10px 0;">${periodLabel}</td>
      </tr>
    </table>

    <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
      This could indicate:<br/>
      • User trying multiple times rapidly<br/>
      • Form submission bug or retry logic<br/>
      • Potential abuse (low probability)
    </p>

    <hr style="border: none; border-top: 2px solid #E95AB2; margin: 30px 0;">

    <p style="color: #999; font-size: 0.9em;">
      Auto-generated alert from MindTrails contact form.<br/>
      Next submission from this email will be accepted after the rate limit period expires.
    </p>
  </div>
</body>
</html>
  `;

  try {
    await ses.sendEmail({
      Source: NOREPLY_EMAIL,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: `⚠️ Rate Limit Alert: ${name} (${email})` },
        Body: { Html: { Data: adminEmailHtml } }
      }
    }).promise();
    console.log('Rate limit alert sent to admin');
  } catch (err) {
    console.error('Failed to send rate limit alert:', err);
    // Don't throw - this is secondary to rejecting the request
  }
}

// Form field validation (Layer 1 & 2: Honeypot + data validation)
function validateForm(data) {
  const errors = [];

  // Honeypot check (Layer 1: spam prevention)
  if (data.website || data.website_url || data.url) {
    console.warn('Honeypot triggered - likely bot submission');
    return { blocked: true, errors: [] };
  }

  // Standard field validation
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

  return { blocked: false, errors };
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

// Response headers with CORS
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  };
}

// Main handler
exports.handler = async (event) => {
  console.log('Event received from', event.requestContext?.identity?.sourceIp || 'unknown IP');

  // Validate request (Layer 3: headers, origin, content-type)
  const reqValidation = validateRequest(event);
  if (!reqValidation.valid) {
    console.warn('Request validation failed:', reqValidation.error);
    return {
      statusCode: 403,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Request validation failed' })
    };
  }

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
        message: params.get('form_fields[message]') || params.get('message'),
        website: params.get('website') || params.get('form_fields[website]') // Honeypot
      };
    }
  } catch (err) {
    console.error('Parse error:', err);
    return {
      statusCode: 400,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Invalid request format' })
    };
  }

  // Validate form (Layer 1 & 2: honeypot + data validation)
  const validation = validateForm(data);
  if (validation.blocked) {
    console.warn('Honeypot triggered - rejecting');
    // Don't reveal honeypot; just return generic error
    return {
      statusCode: 403,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Invalid request' })
    };
  }

  if (validation.errors.length > 0) {
    return {
      statusCode: 400,
      headers: getCorsHeaders(),
      body: JSON.stringify({ errors: validation.errors })
    };
  }

  // Check rate limit (Layer 2b: Per-email rate limiting)
  try {
    const rateLimit = await checkRateLimit(data.email);

    if (rateLimit.rateLimited) {
      console.warn(`Rate limit exceeded for ${data.email}. Last submission: ${rateLimit.timeSinceLastSubmission}s ago`);

      // Send admin alert
      await sendRateLimitAlert(data.email, data.name, rateLimit.timeSinceLastSubmission);

      // Return user-friendly message (don't reveal rate limit details)
      return {
        statusCode: 429,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          error: 'Please wait before submitting again. We received your previous inquiry and will be in touch soon.'
        })
      };
    }
  } catch (err) {
    console.error('Rate limit check failed:', err);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Request validation failed' })
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

    // Update rate limit in DynamoDB
    try {
      await updateRateLimit(data.email);
      console.log('✓ Rate limit updated in DynamoDB');
    } catch (err) {
      console.error('Warning: Failed to update rate limit, but email was sent:', err);
      // Don't fail the request if rate limit update fails - emails were sent successfully
    }

    // Success response
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        success: true,
        message: 'Thank you! We received your inquiry and will be in touch soon.'
      })
    };

  } catch (error) {
    console.error('SES Error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        error: 'Failed to process inquiry. Please try again later or contact us directly.'
      })
    };
  }
};
