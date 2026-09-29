# Contact Form API Documentation

## Overview

The MindTrails contact form API provides a secure endpoint for collecting user messages. The API handles request validation, CAPTCHA verification, rate limiting, and automated email notifications.

## Endpoint

```
POST https://api.mindtrails.net/contact
```

## Request Format

### Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here",
  "captchaToken": "hCaptcha token from frontend"
}
```

### Field Specifications

| Field | Type | Required | Constraints |
|-------|------|----------|-----------|
| name | string | Yes | Max 100 characters |
| email | string | Yes | Valid email format |
| message | string | Yes | Max 5000 characters |
| captchaToken | string | Yes | hCaptcha token (required for verification) |

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Thank you! We will be in touch within 24 hours."
}
```

### Validation Error (400 Bad Request)

Returned when request validation fails:

```json
{
  "success": false,
  "error": "Name is required"
}
```

Possible validation errors:
- "Name is required"
- "Name must be less than 100 characters"
- "Email is required"
- "Invalid email format"
- "Message is required"
- "Message must be less than 5000 characters"
- "CAPTCHA token is required"
- "Invalid JSON in request body"

### CAPTCHA Verification Failed (400 Bad Request)

```json
{
  "success": false,
  "error": "CAPTCHA verification failed"
}
```

This error occurs when:
- CAPTCHA token is invalid
- CAPTCHA verification service is unavailable
- CAPTCHA verification request fails

### Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

The API enforces rate limiting per IP address. By default, only 1 submission per 60 minutes is allowed per IP.

### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

Returned when:
- Email sending fails
- S3 storage fails
- Unexpected server errors occur

## CORS Details

The API supports Cross-Origin Resource Sharing (CORS) for requests from:

```
https://mindtrails.net
```

### CORS Headers

The API automatically includes:

```
Access-Control-Allow-Origin: https://mindtrails.net
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Preflight Requests

The API supports OPTIONS preflight requests for CORS:

```
OPTIONS https://api.mindtrails.net/contact
```

Response:

```
Status: 200 OK
Access-Control-Allow-Origin: https://mindtrails.net
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Rate Limiting

### Configuration

- **Default limit**: 1 submission per 60 minutes per IP address
- **Tracking method**: IP address + email combination
- **Storage**: AWS S3 (rate limit state file)

### How It Works

1. Upon submission, the API checks if the IP address has made a submission in the last 60 minutes
2. If yes, the request is rejected with a 429 error
3. If no, the submission is processed and the rate limit is updated
4. Admin receives an alert email when rate limit is exceeded

### Rate Limit Reset

Rate limits are tracked per IP address. A new submission can be made after 60 minutes from the previous submission.

## Email Workflow

Upon successful submission, the API triggers two automated emails:

### 1. Confirmation Email to User

Sent to the user's email address provided in the form:

- **Subject**: Confirmation of your contact form submission
- **Content**: Confirmation message and expected response time (24 hours)

### 2. Admin Notification Email

Sent to the configured admin email address:

- **Subject**: New contact form submission from [name]
- **Content**: 
  - Submitter name
  - Submitter email
  - Message content
  - Submission timestamp
  - Submitter IP address (for verification)

### Email Sender

Both emails are sent from: `contact@mindtrails.net`

## Processing Steps

The API processes submissions in the following order:

1. **Request Parsing**: Validates JSON format
2. **Input Validation**: Checks all required fields and constraints
3. **CAPTCHA Verification**: Verifies hCaptcha token with hCaptcha servers
4. **Rate Limiting**: Checks if IP has exceeded submission limit
5. **Sanitization**: Removes potentially harmful content from user input
6. **S3 Storage**: Stores submission data for record keeping
7. **Rate Limit Update**: Updates rate limit tracking
8. **Email Sending**: Sends confirmation and admin notification emails
9. **Response**: Returns success or error status

## Error Handling

The API handles errors gracefully:

- Validation errors are returned immediately with descriptive messages
- CAPTCHA verification failures prevent submission
- Rate limit violations return a standard 429 error
- Email sending failures do not block submission (logged for admin review)
- Unexpected errors return a generic 500 error

## Security Features

### Input Sanitization

All user input is sanitized to remove:
- HTML and JavaScript code
- SQL injection attempts
- XSS (Cross-Site Scripting) payloads
- Potentially malicious scripts

### CAPTCHA Protection

All submissions require verification through hCaptcha:
- Prevents automated spam submissions
- Provides bot protection
- Score-based verification (higher score = more human-like)

### Rate Limiting

Protects against:
- Submission spam
- Brute force attacks
- Abuse from single IP addresses

### CORS Restriction

API only accepts requests from `https://mindtrails.net`, preventing cross-origin abuse.

## Testing

### Example Using curl

```bash
curl -X POST https://api.mindtrails.net/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message",
    "captchaToken": "your-hcaptcha-token-here"
  }'
```

### Example Using JavaScript

```javascript
const response = await fetch('https://api.mindtrails.net/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message',
    captchaToken: 'your-hcaptcha-token-here'
  })
});

const data = await response.json();
console.log(data);
```

## Integration Notes

- Always validate input on the frontend before submission
- Always get an hCaptcha token before submitting the form
- Handle rate limit errors gracefully on the frontend
- Provide user feedback for all response states (success, validation errors, rate limit, server errors)
- Test CORS preflight requests in browser environments
- Never expose the hCaptcha secret key in frontend code

## API Status and Monitoring

- API is monitored 24/7 for uptime and performance
- CloudWatch logs are available for debugging
- S3 stores all submissions for audit purposes
- Admin notifications include submission metadata for verification
