const AWS = require('aws-sdk');
const { validateInput } = require('./utils/validation');
const { sanitizeInput } = require('./utils/sanitize');
const { verifyHCaptcha } = require('./utils/captcha');
const { checkRateLimit, updateRateLimit } = require('./utils/rateLimit');
const { storeSubmission } = require('./utils/s3');
const {
  sendConfirmationEmail,
  sendAdminNotification,
  sendRateLimitAlert
} = require('./utils/email');

const s3 = new AWS.S3();
const ses = new AWS.SES();

const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const CORS_ORIGIN = 'https://mindtrails.net';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const method = event.requestContext.http.method;
  console.log('Contact form handler invoked', {
    method: method,
    path: event.requestContext.http.path
  });

  // Step 1: CORS preflight handling
  if (method === 'OPTIONS') {
    return response(200, { success: true });
  }

  // Only allow POST
  if (method !== 'POST') {
    return response(400, {
      success: false,
      error: 'Only POST requests are allowed'
    });
  }

  try {
    // Step 2: Request parsing and validation
    let input;
    try {
      input = JSON.parse(event.body);
    } catch (error) {
      console.error('JSON parse error:', error.message);
      return response(400, {
        success: false,
        error: 'Invalid JSON in request body'
      });
    }

    const validationResult = validateInput(input);
    if (!validationResult.valid) {
      console.log('Validation failed:', validationResult.error);
      return response(400, {
        success: false,
        error: validationResult.error
      });
    }

    // Step 3: CAPTCHA verification
    let captchaResult;
    try {
      captchaResult = await verifyHCaptcha(input.captchaToken, HCAPTCHA_SECRET_KEY);
      console.log('CAPTCHA verification result:', {
        success: captchaResult.success,
        score: captchaResult.score
      });

      if (!captchaResult.success) {
        console.log('CAPTCHA verification failed');
        return response(400, {
          success: false,
          error: 'CAPTCHA verification failed'
        });
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error.message);
      return response(400, {
        success: false,
        error: 'CAPTCHA verification failed'
      });
    }

    // Step 4: Rate limiting
    const clientIp = event.requestContext.http.sourceIp;
    console.log('Checking rate limit for IP:', clientIp);

    let rateLimitResult;
    try {
      rateLimitResult = await checkRateLimit(clientIp, S3_BUCKET_NAME);
      console.log('Rate limit check result:', {
        allowed: rateLimitResult.allowed,
        error: rateLimitResult.error
      });

      if (!rateLimitResult.allowed) {
        console.log('Rate limit exceeded for IP:', clientIp);

        // Send admin alert for rate limit
        try {
          await sendRateLimitAlert(
            ADMIN_EMAIL,
            clientIp,
            rateLimitResult.lastEmail,
            rateLimitResult.secondsUntilAllowed
          );
          console.log('Rate limit alert email sent to admin');
        } catch (emailError) {
          console.error('Failed to send rate limit alert:', emailError.message);
        }

        return response(429, {
          success: false,
          error: 'Too many requests. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Rate limit check error:', error.message);
      return response(500, {
        success: false,
        error: 'Internal server error'
      });
    }

    // Step 5: Sanitization and storage
    const sanitized = sanitizeInput(input);
    console.log('Input sanitized');

    const submission = {
      name: sanitized.name,
      email: sanitized.email,
      message: sanitized.message,
      ip: clientIp
    };

    try {
      await storeSubmission(submission, S3_BUCKET_NAME);
      console.log('Submission stored successfully');
    } catch (error) {
      console.error('Failed to store submission:', error.message);
      return response(500, {
        success: false,
        error: 'Failed to process submission'
      });
    }

    try {
      await updateRateLimit(clientIp, sanitized.email, S3_BUCKET_NAME);
      console.log('Rate limit updated for IP:', clientIp);
    } catch (error) {
      console.error('Failed to update rate limit:', error.message);
      return response(500, {
        success: false,
        error: 'Failed to process submission'
      });
    }

    // Step 6: Email sending
    try {
      await sendConfirmationEmail(sanitized.email, sanitized.name);
      console.log('Confirmation email sent to user:', sanitized.email);
    } catch (error) {
      console.error('Failed to send confirmation email:', error.message);
    }

    try {
      await sendAdminNotification(
        ADMIN_EMAIL,
        sanitized.name,
        sanitized.email,
        sanitized.message,
        clientIp
      );
      console.log('Admin notification email sent');
    } catch (error) {
      console.error('Failed to send admin notification:', error.message);
    }

    // Step 7: Success response
    console.log('Contact form submission successful');
    return response(200, {
      success: true,
      message: 'Thank you! We will be in touch within 24 hours.'
    });
  } catch (error) {
    console.error('Unexpected error:', error.message, error.stack);
    return response(500, {
      success: false,
      error: 'Internal server error'
    });
  }
};
