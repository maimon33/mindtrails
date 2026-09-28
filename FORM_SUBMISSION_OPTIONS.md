# Form Submission & Email Delivery Options

Your contact form currently submits but **doesn't send emails**. Here are your safe options to send emails via AWS SES:

---

## Option 1: AWS Lambda + API Gateway (⭐ Recommended)

**How it works:**
1. Form submission → POST to API Gateway endpoint
2. API Gateway triggers Lambda function
3. Lambda validates data → calls AWS SES → sends emails
4. Response returned to form

**Security:**
- ✅ No AWS credentials exposed in frontend code
- ✅ Lambda execution role has SES permission (doesn't expose keys)
- ✅ Validation happens server-side
- ✅ CORS + API key protection available
- ✅ Cost: Free tier (1M Lambda invocations/month)

**Setup:**
```bash
# 1. Create Lambda function (Node.js 20.x)
# 2. Attach policy: AmazonSESFullAccess
# 3. Create API Gateway REST endpoint
# 4. Enable CORS
# 5. Update form action to POST to Lambda URL
```

**Form HTML change:**
```html
<form method="POST" action="https://your-lambda-url.lambda-url.region.on.aws/">
  <!-- form fields -->
</form>
```

**Lambda example (Node.js):**
```javascript
const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'eu-central-1' });

exports.handler = async (event) => {
  const { name, email, phone, message } = JSON.parse(event.body);

  // Validate
  if (!name || !email || !message) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  try {
    // Send to visitor
    await ses.sendEmail({
      Source: 'noreply@mindtrails.net',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'We received your inquiry - MindTrails' },
        Body: { 
          Html: { Data: `Hi ${name},\n\nThank you for reaching out!...\n\nBest,\nMindTrails Team` }
        }
      }
    }).promise();

    // Send copy to daniel@mindtrails.net
    await ses.sendEmail({
      Source: 'noreply@mindtrails.net',
      Destination: { ToAddresses: ['daniel@mindtrails.net'] },
      Message: {
        Subject: { Data: `New inquiry from ${name}` },
        Body: { 
          Html: { Data: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong> ${message}</p>` }
        }
      }
    }).promise();

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
```

---

## Option 2: Third-Party Services (Easier, Less Control)

### **Netlify Forms** (if hosting moves there)
- Easy setup, just add `netlify` attribute to form
- Automatic email notifications
- Cost: Free tier includes forms

### **Formspree** (works anywhere)
```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
```
- ✅ No backend needed
- ✅ Secure (handles CORS, validation)
- ✅ Email notifications built-in
- ✅ Cost: Free up to 50/month, $10/month after
- ❌ Less customizable

### **Basin** (lightweight)
```html
<form action="https://usebasin.com/f/YOUR_ID" method="POST">
```
- Similar to Formspree
- Free tier available

---

## Option 3: Zapier/Make (Workflow Automation)

- Setup webhook form endpoint
- Connect to Zapier workflow
- Zapier sends email via Gmail/SendGrid
- ✅ Simple, no coding
- ❌ Rate limits on free tier

---

## Option 4: Custom Backend (Not Recommended)

EC2, RDS, etc. — overkill for a static site.

---

## Recommendation for MindTrails

**Use Option 1 (Lambda + API Gateway):**
- You already have AWS account with SES configured
- Most secure (credentials never exposed)
- Cheapest for low volume (free tier covers you)
- Most control over email content and logic
- Can add features later (spam detection, analytics, etc.)

---

## Next Steps (When Ready)

1. **Create Lambda function** in AWS console
2. **Add SES permissions** to Lambda execution role
3. **Create API Gateway endpoint** (REST API)
4. **Update form action** in `index.html` to POST to Lambda URL
5. **Test with form submission**
6. **Verify emails sent** to visitor + daniel@mindtrails.net

**Cost estimate:** $0-1/month for typical usage

Would you like me to set up the Lambda + API Gateway code when you're ready?
