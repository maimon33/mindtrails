const AWS = require('aws-sdk');
const ses = new AWS.SES();

async function sendConfirmationEmail(to, name) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: 'We received your message'
      },
      Body: {
        Text: {
          Data: `Hello ${name},\n\nThank you for contacting us. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nMindTrails Team`
        }
      }
    }
  };

  return ses.sendEmail(params).promise();
}

async function sendAdminNotification(adminEmail, name, email, message, ip, phone) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [adminEmail]
    },
    Message: {
      Subject: {
        Data: 'New contact form submission'
      },
      Body: {
        Text: {
          Data: `New contact form submission received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nIP: ${ip}\nMessage:\n${message}`
        }
      }
    }
  };

  return ses.sendEmail(params).promise();
}

async function sendRateLimitAlert(adminEmail, ip, email, secondsUntilAllowed) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [adminEmail]
    },
    Message: {
      Subject: {
        Data: 'Contact form: Rate limit exceeded'
      },
      Body: {
        Text: {
          Data: `Rate limit exceeded alert:\n\nIP: ${ip}\nEmail: ${email}\nSeconds until next submission allowed: ${secondsUntilAllowed}`
        }
      }
    }
  };

  return ses.sendEmail(params).promise();
}

module.exports = {
  sendConfirmationEmail,
  sendAdminNotification,
  sendRateLimitAlert
};
