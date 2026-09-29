# Contact Form Frontend Integration Guide

## Overview

This guide provides instructions to integrate the MindTrails contact form on your frontend website.

## Prerequisites

- Contact form API deployed and working (see CONTACT_FORM_DEPLOYMENT.md)
- hCaptcha sitekey (public key) from your hCaptcha account
- Basic HTML, CSS, and JavaScript knowledge

## Step 1: Add hCaptcha Script

Add the hCaptcha script tag to your HTML document, typically in the `<head>` section:

```html
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
```

This script loads the hCaptcha widget and provides the JavaScript API for token generation.

## Step 2: HTML Form Markup

Create a contact form with the required fields:

```html
<form id="contactForm" method="POST">
  <div class="form-group">
    <label for="name">Name:</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      maxlength="100"
      placeholder="Your full name"
      required
    />
  </div>

  <div class="form-group">
    <label for="email">Email:</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      placeholder="your@email.com"
      required
    />
  </div>

  <div class="form-group">
    <label for="message">Message:</label>
    <textarea 
      id="message" 
      name="message" 
      rows="6"
      maxlength="5000"
      placeholder="Your message here..."
      required
    ></textarea>
  </div>

  <div class="h-captcha" data-sitekey="YOUR_HCAPTCHA_SITEKEY"></div>

  <button type="submit" id="submitBtn">Send Message</button>
  <div id="status"></div>
</form>
```

Replace `YOUR_HCAPTCHA_SITEKEY` with your actual hCaptcha sitekey from the hCaptcha dashboard.

## Step 3: JavaScript Handler

Add JavaScript to handle form submission and API communication:

```javascript
document.getElementById('contactForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const statusDiv = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');

  try {
    // Disable submit button to prevent double-submission
    submitBtn.disabled = true;
    statusDiv.textContent = 'Sending...';
    statusDiv.className = 'status-loading';

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate input on frontend
    if (!name || name.length > 100) {
      throw new Error('Name is required and must be less than 100 characters');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Valid email is required');
    }
    if (!message || message.length > 5000) {
      throw new Error('Message is required and must be less than 5000 characters');
    }

    // Get hCaptcha token
    const captchaToken = hcaptcha.getResponse();
    if (!captchaToken) {
      throw new Error('Please complete the CAPTCHA');
    }

    // Prepare request payload
    const payload = {
      name: name,
      email: email,
      message: message,
      captchaToken: captchaToken
    };

    // Send to API
    const response = await fetch('https://api.mindtrails.net/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Handle response
    if (response.ok && result.success) {
      statusDiv.textContent = result.message || 'Message sent successfully!';
      statusDiv.className = 'status-success';
      
      // Reset form
      document.getElementById('contactForm').reset();
      
      // Reset hCaptcha
      hcaptcha.reset();
    } else if (response.status === 429) {
      statusDiv.textContent = result.error || 'Too many requests. Please try again later.';
      statusDiv.className = 'status-error';
    } else {
      statusDiv.textContent = result.error || 'Failed to send message. Please try again.';
      statusDiv.className = 'status-error';
    }
  } catch (error) {
    statusDiv.textContent = error.message || 'An error occurred. Please try again.';
    statusDiv.className = 'status-error';
    console.error('Contact form error:', error);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
  }
});
```

## Step 4: CSS Styling

Add styles for your contact form:

```css
/* Form container */
#contactForm {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Form groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 150px;
}

/* hCaptcha */
.h-captcha {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

/* Submit button */
#submitBtn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #4CAF50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

#submitBtn:hover:not(:disabled) {
  background-color: #45a049;
}

#submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status messages */
#status {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  display: none;
}

#status:not(:empty) {
  display: block;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-loading {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

/* Responsive design */
@media (max-width: 768px) {
  #contactForm {
    margin: 1rem;
    padding: 1.5rem;
  }

  .form-group input,
  .form-group textarea {
    font-size: 16px; /* Prevents zoom on mobile when focused */
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  #contactForm {
    background-color: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .form-group label {
    color: #e0e0e0;
  }

  .form-group input,
  .form-group textarea {
    background-color: #333;
    color: #e0e0e0;
    border-color: #444;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    border-color: #66bb6a;
    box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.1);
  }

  #submitBtn {
    background-color: #66bb6a;
  }

  #submitBtn:hover:not(:disabled) {
    background-color: #4caf50;
  }

  .status-success {
    background-color: #1b5e20;
    color: #a5d6a7;
    border-color: #2e7d32;
  }

  .status-error {
    background-color: #b71c1c;
    color: #ef9a9a;
    border-color: #c62828;
  }

  .status-loading {
    background-color: #424242;
    color: #bdbdbd;
    border-color: #616161;
  }
}
```

## Step 5: Complete Example

Here's a complete minimal example you can use:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form - MindTrails</title>
  <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
  <style>
    /* Paste CSS from Step 4 here */
  </style>
</head>
<body>
  <form id="contactForm" method="POST">
    <h2>Contact Us</h2>
    
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" maxlength="100" required />
    </div>

    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required />
    </div>

    <div class="form-group">
      <label for="message">Message:</label>
      <textarea id="message" name="message" rows="6" maxlength="5000" required></textarea>
    </div>

    <div class="h-captcha" data-sitekey="YOUR_HCAPTCHA_SITEKEY"></div>

    <button type="submit" id="submitBtn">Send Message</button>
    <div id="status"></div>
  </form>

  <script>
    // Paste JavaScript from Step 3 here
  </script>
</body>
</html>
```

## Step 6: Testing Locally

### 6.1 Test with Invalid Data

Test validation by:
- Submitting without filling required fields
- Entering invalid email format
- Submitting without completing CAPTCHA
- Entering message longer than 5000 characters

Expected behavior: Error message displays, form is not submitted.

### 6.2 Test CORS

If testing from localhost or different domain, verify CORS is working:

```javascript
// Test CORS preflight
fetch('https://api.mindtrails.net/contact', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
  .then(r => console.log('CORS working:', r.status === 200))
  .catch(e => console.log('CORS error:', e));
```

### 6.3 Test with Real hCaptcha Token

1. Complete the CAPTCHA in the form
2. Check browser console: `console.log(hcaptcha.getResponse())`
3. You should see a token string
4. Submit the form
5. Verify success message and email receipt

### 6.4 Test Rate Limiting

1. Submit the form successfully
2. Try to submit again immediately
3. Expect error: "Too many requests. Please try again later."
4. Wait 60 minutes (default) and try again

## Step 7: Deployment Considerations

### 7.1 Environment Variables

Store hCaptcha sitekey as environment variable (not hardcoded):

```html
<div class="h-captcha" data-sitekey="{{ HCAPTCHA_SITEKEY }}"></div>
```

Replace at build time with your framework's environment variable system.

### 7.2 API Endpoint Configuration

Make API endpoint configurable:

```javascript
const API_ENDPOINT = process.env.REACT_APP_CONTACT_API_ENDPOINT || 'https://api.mindtrails.net/contact';

// Then use:
const response = await fetch(API_ENDPOINT, { /* ... */ });
```

### 7.3 Error Handling

Provide user-friendly error messages:

```javascript
const errorMessages = {
  'Too many requests. Please try again later.': 'Please wait before submitting again.',
  'CAPTCHA verification failed': 'CAPTCHA verification failed. Please try again.',
  'Internal server error': 'Server error. Please try again later.'
};

const displayError = (error) => {
  const userFriendlyMessage = errorMessages[error] || error;
  statusDiv.textContent = userFriendlyMessage;
};
```

## Troubleshooting

### Issue: CAPTCHA Widget Not Loading

**Cause**: hCaptcha script not loaded or blocked

**Solution**:
1. Verify script tag is in HTML: `<script src="https://js.hcaptcha.com/1/api.js"></script>`
2. Check browser console for errors
3. Ensure hCaptcha is not blocked by ad blocker or content security policy

### Issue: CORS Errors in Browser Console

**Error**: "Access to XMLHttpRequest at '...' from origin blocked by CORS policy"

**Cause**: API endpoint not configured to accept requests from your domain

**Solution**:
1. Verify API endpoint is: `https://api.mindtrails.net/contact`
2. Ensure your domain is: `https://mindtrails.net`
3. Check Terraform configuration CORS origin setting
4. If domain is different, update CORS origin in Lambda code

### Issue: Form Submission Fails with "Only POST requests are allowed"

**Cause**: Request method is incorrect

**Solution**:
1. Verify JavaScript uses: `method: 'POST'`
2. Check Content-Type header: `'Content-Type': 'application/json'`

### Issue: hCaptcha Token Undefined

**Error**: "`hcaptcha.getResponse()` returns empty string"

**Cause**: CAPTCHA not completed by user

**Solution**:
1. Verify `data-sitekey` attribute in div element
2. Ensure sitekey is correct (from hCaptcha dashboard)
3. Wait for user to complete CAPTCHA challenge
4. Check browser console for hCaptcha errors

### Issue: Emails Not Received

**Cause**: SES configuration issues

**Solution**:
1. Verify sender email is verified in AWS SES
2. Verify admin email is verified in AWS SES
3. Check AWS SES sandbox mode status
4. If in sandbox, verify recipient email is verified
5. Check CloudWatch logs for email sending errors

### Issue: Rate Limit Always Triggered

**Cause**: Rate limit configuration or check failing

**Solution**:
1. Wait 60 minutes (default) between submissions from same IP
2. If testing locally, try from different IP/device
3. Check CloudWatch logs for rate limit details
4. Verify S3 bucket has proper permissions

### Issue: Validation Passes Frontend But Fails at API

**Cause**: Server-side validation is stricter

**Solution**:
1. Check CONTACT_FORM_API.md for exact validation rules
2. Ensure frontend validation matches backend
3. Check error message returned from API
4. Adjust frontend validation if needed

## Performance Optimization

### 7.1 Lazy Load hCaptcha

Load hCaptcha only when form is visible:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.getElementById('contactForm'));
```

### 7.2 Debounce Submit Button

Prevent double-submission with debounce:

```javascript
let isSubmitting = false;

document.getElementById('contactForm').addEventListener('submit', async (event) => {
  if (isSubmitting) {
    event.preventDefault();
    return;
  }
  isSubmitting = true;
  // ... rest of submit handler
  isSubmitting = false;
});
```

## Security Best Practices

1. **Never expose secrets**: Keep hCaptcha secret key on backend only
2. **Validate on both sides**: Frontend validation for UX, backend for security
3. **Use HTTPS**: Always submit to HTTPS endpoint
4. **Rate limit**: Respects server rate limiting, don't bypass it
5. **Sanitize input**: Backend sanitizes, but clean on frontend too
6. **CSRF protection**: API uses CORS, trust only mindtrails.net domain
7. **Content Security Policy**: Add CSP headers to your website:
   ```
   script-src 'self' https://js.hcaptcha.com;
   frame-src https://hcaptcha.com https://*.hcaptcha.com;
   ```

## Framework-Specific Guides

### React Example

```jsx
import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const captchaToken = window.hcaptcha.getResponse();
    
    try {
      const response = await fetch('https://api.mindtrails.net/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          captchaToken: captchaToken
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        e.target.reset();
        window.hcaptcha.reset();
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error sending message' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
      {status && <div className={`status-${status.type}`}>{status.message}</div>}
    </form>
  );
}
```

### Vue Example

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" type="text" maxlength="100" required />
    <input v-model="form.email" type="email" required />
    <textarea v-model="form.message" maxlength="5000" required></textarea>
    
    <div class="h-captcha" data-sitekey="YOUR_HCAPTCHA_SITEKEY"></div>
    
    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Sending...' : 'Send' }}
    </button>
    
    <div v-if="status" :class="`status-${status.type}`">{{ status.message }}</div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: { name: '', email: '', message: '' },
      status: null,
      isSubmitting: false
    };
  },
  methods: {
    async handleSubmit() {
      this.isSubmitting = true;
      const captchaToken = window.hcaptcha.getResponse();
      
      try {
        const response = await fetch('https://api.mindtrails.net/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...this.form, captchaToken })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.status = { type: 'success', message: data.message };
          this.form = { name: '', email: '', message: '' };
          window.hcaptcha.reset();
        } else {
          this.status = { type: 'error', message: data.error };
        }
      } catch (error) {
        this.status = { type: 'error', message: 'Error sending message' };
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review CONTACT_FORM_API.md for API details
3. Check CloudWatch logs for server-side errors
4. Verify SES configuration in AWS console
5. Test with curl to isolate frontend vs backend issues
