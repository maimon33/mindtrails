# Contact Form Infrastructure Design

**Date:** 2026-09-29  
**Purpose:** Enable "Get In Touch" contact form with email notifications, rate limiting, and CAPTCHA protection.

---

## Overview

A contact form submission system using **API Gateway + Lambda + SES** that validates user input, enforces per-IP rate limiting (1 submission per 60 minutes), sends confirmation emails to users and admin alerts to site owner, and stores submissions aggregated by month in S3.

### Why This Approach

- **API Gateway** handles CORS natively, provides clean REST endpoint, and logs source IPs
- **Lambda** processes validation (CAPTCHA), rate limiting, and email delivery asynchronously
- **S3** stores submissions and IP tracking (simple, cost-effective for contact-form volumes)
- **SES** sends emails (low cost, reliable, integrates with Lambda)

Alternative considered: S3-triggered Lambda. Rejected because S3 is not an API service—S3 events are async, presigned URLs are complex for static frontends, and rate limiting per IP is awkward with S3 event model.

---

## Architecture

```
User submits form (static HTML)
  ↓
POST to API Gateway endpoint with: name, email, message, CAPTCHA token
  ↓
API Gateway logs source IP → invokes Lambda
  ↓
Lambda:
  1. Validates CAPTCHA token
  2. Checks IP against rate-limit tracking file (ip-tracking-YYYY-MM.json)
  3. If rate-limited: return 429, send admin alert email
  4. If valid: store submission, update tracking file, send emails
  ↓
S3:
  - contact-submissions-YYYY-MM.json (aggregated submissions)
  - ip-tracking-YYYY-MM.json (IP + last submission timestamp)
  ↓
SES:
  - Confirmation email to user
  - Notification email to admin
  - Alert email if rate limit exceeded
```

---

## Components

### 1. API Gateway

**Endpoint:** `POST /contact`

**CORS:** Allow origin `https://mindtrails.net` only

**Features:**
- Logs source IP in request headers
- Returns appropriate HTTP status codes (200, 400, 429, 500)
- Responds within 1 second

**Response body:**
```json
{
  "success": true,
  "message": "Thank you! We'll respond within 24 hours."
}
```

Error responses:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

---

### 2. Lambda Function

**Trigger:** API Gateway POST /contact

**Runtime:** Node.js 20.x

**Responsibilities:**

1. **Input validation**
   - name: required, non-empty string
   - email: required, valid email format
   - message: required, non-empty string
   - captchaToken: required, non-empty string

2. **CAPTCHA verification**
   - Call hCaptcha API (or Cloudflare Turnstile) to verify token
   - Fail: return 400 "CAPTCHA failed. Please try again."

3. **Rate limiting**
   - Read `ip-tracking-YYYY-MM.json` from S3
   - Extract client IP from `event.requestContext.identity.sourceIp`
   - Check if IP has entry with timestamp < 60 minutes ago
   - If yes: return 429, send admin alert email
   - If no: proceed

4. **Store submission**
   - Sanitize inputs (strip HTML/script tags)
   - Append to `contact-submissions-YYYY-MM.json` in S3
   - Entry format:
     ```json
     {
       "timestamp": "2026-09-29T14:32:00Z",
       "name": "John Doe",
       "email": "john@example.com",
       "message": "...",
       "ip": "203.0.113.45"
     }
     ```

5. **Update IP tracking**
   - Add/update entry in `ip-tracking-YYYY-MM.json`:
     ```json
     {
       "203.0.113.45": {
         "timestamp": "2026-09-29T14:32:00Z",
         "email": "john@example.com"
       }
     }
     ```

6. **Send emails**
   - **To user:** Confirmation message (subject: "We received your message")
   - **To admin:** Full submission details (subject: "New contact form submission")
   - **If rate-limited:** Alert to admin (subject: "Contact form: Rate limit exceeded")

7. **Return response**
   - Success: 200 with thank-you message
   - Validation fail: 400 with field error
   - Rate limited: 429 with retry message
   - Internal error: 500 with generic error

**Error handling:**
| Scenario | Response | Action |
|----------|----------|--------|
| CAPTCHA fails | 400 | No email sent |
| Rate limited | 429 | Admin alert sent |
| Invalid email | 400 | No email sent |
| SES fails | 500 | Log to CloudWatch, don't send emails (avoid duplicates on retry) |
| S3 write fails | 500 | Log to CloudWatch |

**IAM Permissions:**
- `s3:GetObject`, `s3:PutObject` on `submissions/` bucket prefix
- `ses:SendEmail` to admin and user email addresses
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch

---

### 3. S3 Bucket (submissions)

**Bucket name:** `mindtrails-contact-submissions` (or similar)

**Structure:**
```
submissions/
├── contact-submissions-2026-09.json
├── contact-submissions-2026-10.json
└── ...
└── ip-tracking-2026-09.json
└── ip-tracking-2026-10.json
```

**Retention:** No automatic deletion (admin manages manually). Optional: S3 lifecycle rules to archive old files.

**Access:** Lambda only (via IAM role). Admin reviews via S3 console or script.

**File format (submissions):**
```json
[
  {
    "timestamp": "2026-09-29T14:32:00Z",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I'm interested in booking a custom quest...",
    "ip": "203.0.113.45"
  },
  {
    "timestamp": "2026-09-29T15:45:00Z",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "How long does a quest typically take?",
    "ip": "198.51.100.78"
  }
]
```

**File format (IP tracking):**
```json
{
  "203.0.113.45": {
    "timestamp": "2026-09-29T14:32:00Z",
    "email": "john@example.com"
  },
  "198.51.100.78": {
    "timestamp": "2026-09-29T15:45:00Z",
    "email": "jane@example.com"
  }
}
```

---

### 4. SES (Email Service)

**Email sender:** `contact@mindtrails.net` (verified in SES)

**Three email types:**

**A. Confirmation to user**
```
To: [user email]
From: contact@mindtrails.net
Subject: We received your message

Hi [name],

Thank you for reaching out! We've received your message and will get back to you within 24 hours.

Best,
MindTrails Team
```

**B. Notification to admin**
```
To: [admin email]
From: contact@mindtrails.net
Subject: New contact form submission

New submission:

Name: [name]
Email: [email]
Message: [message]
IP: [ip]
Time: [timestamp]

View all submissions: [link to S3 submissions file or instructions]
```

**C. Rate limit alert**
```
To: [admin email]
From: contact@mindtrails.net
Subject: Contact form: Rate limit exceeded

Multiple attempts from IP [ip] at [timestamp].
Previous email: [email from first attempt]

This may indicate spam or a user retrying. Review submissions for patterns.
```

**Configuration:**
- SES region: `eu-central-1` (matches S3 bucket region)
- Email addresses must be verified in SES (via AWS console or Terraform)
- Production mode (not sandbox)

---

### 5. Frontend Integration

**Form location:** HTML form on site (e.g., in "Get In Touch" section)

**CAPTCHA integration:**
- Include hCaptcha script: `<script src="https://js.hcaptcha.com/1/api.js" async defer></script>`
- Render widget: `<div class="h-captcha" data-sitekey="..."></div>`
- On submit, retrieve token: `hcaptcha.getResponse()`

**Form submission (JavaScript):**
```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const token = hcaptcha.getResponse();
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
    captchaToken: token
  };
  
  try {
    const response = await fetch('https://api-xxxxx.execute-api.eu-central-1.amazonaws.com/prod/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    if (response.ok) {
      showMessage('Thank you! We\'ll be in touch.');
      document.getElementById('contactForm').reset();
      hcaptcha.reset();
    } else {
      showMessage(data.error || 'Something went wrong.');
    }
  } catch (error) {
    showMessage('An error occurred. Please try again.');
  }
});
```

**Response handling:**
- `200`: Show "Thank you! We'll respond within 24 hours." + clear form
- `429`: Show "You've already submitted recently. Please try again later."
- `400`: Show field-specific error (e.g., "Invalid email address")
- `500`: Show "Something went wrong. Please try again."

---

## Rate Limiting Logic

**Rule:** Maximum 1 submission per 60 minutes per IP address.

**Implementation:**
1. Extract client IP from `event.requestContext.identity.sourceIp` (API Gateway populates this)
2. Read `ip-tracking-YYYY-MM.json` from S3
3. Check if IP exists in tracking file
4. If exists: compare `timestamp` to current time
   - If `now - timestamp < 3600` seconds: **rate limited**
   - If `now - timestamp >= 3600` seconds: **allowed**, update timestamp
5. If not exists: **allowed**, add IP to tracking file

**Rate limit exceeded behavior:**
- Return 429 Too Many Requests to client
- Send admin alert email with IP, previous email, and current attempt time
- Do NOT send confirmation email to user (avoid spam)
- Log incident to CloudWatch

---

## Security Measures

1. **CORS:** Restrict API Gateway to `https://mindtrails.net` origin only
2. **CAPTCHA:** hCaptcha free tier prevents bots
3. **Rate limiting:** Per-IP enforcement stops brute-force spam
4. **Input sanitization:** Strip HTML/script tags from name and message before storing
5. **IP logging:** Helps identify spam patterns
6. **CloudWatch logs:** Audit trail of all submissions, errors, rate limits
7. **IAM least privilege:** Lambda role has minimal permissions (S3 submissions bucket only, SES for specific emails)
8. **No sensitive data:** Contact form does not handle passwords, payment info, or credentials

**What we're NOT doing:**
- Email verification (contact form doesn't require it)
- Encryption at rest (contact forms aren't sensitive)
- DDoS protection (API Gateway + rate limit sufficient for contact form)

---

## Testing Strategy

**Local testing (before Terraform apply):**
1. Mock CAPTCHA verification (hardcode pass/fail)
2. Test rate limit logic with fake IPs
3. Test email sending with SES sandbox mode

**End-to-end testing (after Terraform apply):**
1. Submit valid form → check S3 submission file + verify emails arrive
2. Submit again immediately → verify 429 response + admin alert email
3. Submit with invalid CAPTCHA → verify 400 response
4. Submit with missing email → verify 400 response

**Production checklist:**
- Verify SES email addresses are working
- Test with real email addresses
- Verify IP tracking file creates correctly
- Monitor CloudWatch logs for errors

---

## Deployment

**Terraform creates:**
- API Gateway REST API with POST /contact method
- Lambda function with CORS-enabled API Gateway integration
- S3 bucket for submissions + IP tracking
- IAM role for Lambda (S3, SES permissions)
- SES email identity (verified sender)
- CloudWatch log group for Lambda

**Deployment order:**
1. `terraform init` (initialize state)
2. `terraform plan` (review resources)
3. `terraform apply` (create AWS resources)
4. Update HTML form with API endpoint URL from Terraform outputs
5. Test end-to-end submission
6. Monitor CloudWatch logs for any errors

**Rollback:** `terraform destroy` removes all AWS resources.

---

## Costs

- **API Gateway:** ~$3.50 per 1M requests (~$0.04/month for typical contact form)
- **Lambda:** Free tier covers contact form easily (<1M invocations/month)
- **S3:** Negligible (contacts are small JSON, <1KB per submission)
- **SES:** ~$0.10 per 1,000 emails (typical contact form: $0/month)
- **Total:** ~$3.50/month (mostly API Gateway)

---

## Known Constraints & Open Questions

1. **CAPTCHA provider:** hCaptcha vs Cloudflare Turnstile vs custom?
   - Recommendation: hCaptcha (free, privacy-friendly, widely used)
   
2. **Admin email:** Where should notifications go?
   - Example: maimon33@gmail.com (to be configured in Terraform variables)

3. **Sender email:** What email address should contact form come from?
   - Example: contact@mindtrails.net (must be verified in SES)

4. **IP rotation:** Should tracking file clean up old entries?
   - Recommendation: Monthly rotation (separate file per month) keeps it manageable

---

## Next Steps

1. Review this spec and approve
2. Invoke writing-plans skill to create detailed implementation plan
3. Write Terraform code (provider, API Gateway, Lambda, S3, SES, IAM)
4. Test locally with mocked CAPTCHA
5. Deploy to AWS and test end-to-end
