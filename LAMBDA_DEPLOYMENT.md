# Lambda + API Gateway Deployment Guide

Deploy the MindTrails contact form handler using AWS Lambda and API Gateway.

---

## Prerequisites

- AWS account with SES verified
- `daniel@mindtrails.net` and `noreply@mindtrails.net` verified in SES (or request production access)
- AWS CLI installed (optional, can use console)

---

## Step 1: Create IAM Role for Lambda

1. Go to **IAM Console** → **Roles** → **Create Role**
2. Select **AWS Service** → **Lambda** → **Next**
3. Add permissions:
   - Search for "SES" and attach **`AmazonSESFullAccess`**
   - Search for "Logs" and attach **`CloudWatchLogsFullAccess`** (for debugging)
4. Click **Create Role**
5. Name it: `mindtrails-lambda-ses-role`
6. Note the **Role ARN** (you'll need it)

---

## Step 2: Create Lambda Function

### Via AWS Console

1. Go to **Lambda Console** → **Create Function**
2. **Function name:** `mindtrails-contact-form`
3. **Runtime:** Node.js 20.x
4. **Architecture:** x86_64
5. **Execution role:** Select `mindtrails-lambda-ses-role` (created above)
6. Click **Create Function**

### Upload Code

1. Download `lambda/handler.js` from this repo
2. In Lambda Console:
   - Click **Code** tab
   - Delete default `index.js`
   - Click **Upload from** → **Upload a file**
   - Select `handler.js`
   - Click **Deploy**

### Add Package Dependencies

1. Create `package.json` in Lambda code folder:
```json
{
  "name": "mindtrails-contact-form",
  "version": "1.0.0",
  "dependencies": {
    "aws-sdk": "^2.1000.0"
  }
}
```

2. Lambda includes `aws-sdk` by default (no npm install needed)

### Set Environment Variable

1. In Lambda Console → **Configuration** → **Environment variables**
2. Add:
   - **Key:** `AWS_REGION`
   - **Value:** `eu-central-1`
3. Save

---

## Step 3: Configure Function URL (Easy) OR API Gateway (More Control)

### Option A: Lambda Function URL (Simpler)

1. In Lambda Console → **Configuration** → **Function URL**
2. Click **Create function URL**
3. **Auth type:** `NONE` (form submissions don't use auth)
4. **CORS:** Enable and set:
   - **Allowed origins:** `https://mindtrails.net`
   - **Allowed methods:** `POST`
   - **Allowed headers:** `content-type`
   - **Max age:** `300`
5. Copy the **Function URL** (looks like `https://xxxxx.lambda-url.eu-central-1.on.aws/`)

### Option B: API Gateway (More Features)

1. Go to **API Gateway Console** → **Create API**
2. Select **REST API** → **Build**
3. **Name:** `mindtrails-contact-form`
4. Create **Resource** `/contact`
5. Create **POST Method** → Select Lambda function
6. Enable **CORS**:
   - **Access-Control-Allow-Headers:** `Content-Type`
   - **Access-Control-Allow-Origins:** `https://mindtrails.net`
7. **Deploy** to stage `prod`
8. Copy the **Invoke URL** (looks like `https://xxxxx.execute-api.eu-central-1.amazonaws.com/prod/contact`)

---

## Step 4: Verify SES Email Addresses

**Important:** SES in sandbox mode requires verified email addresses.

1. Go to **SES Console** → **Verified Identities**
2. Verify **both**:
   - `noreply@mindtrails.net`
   - `daniel@mindtrails.net`
3. Click **Create Identity** → Enter email → Verify link sent to inbox
4. Check email, click verification link

**Note:** If you need to send to unverified emails, request **SES Production Access** (usually approved in 24hrs)

---

## Step 5: Update Form HTML

In `content/index.html`, update the form `action` attribute:

**Find:**
```html
<form class="elementor-form" method="post" name="Contact Us" aria-label="Contact Us">
  <input type="hidden" name="post_id" value="15"/>
  ...
```

**Replace with:**
```html
<form class="elementor-form" method="POST" action="https://xxxxx.lambda-url.eu-central-1.on.aws/" 
      enctype="application/x-www-form-urlencoded">
  ...
  <!-- Keep all existing form fields -->
  ...
</form>
```

⚠️ Use **your actual Lambda URL** from Step 3.

---

## Step 6: Test Form Submission

1. Deploy changes to S3 (push to main):
   ```bash
   git push origin main
   ```
   This triggers GitHub Actions to deploy to S3.

2. Visit https://mindtrails.net → scroll to "Get In Touch"
3. Fill out form:
   - Full Name: Test User
   - Email: your-email@example.com
   - Phone: +972-123-456-789
   - Message: This is a test message from the form.
4. Click **Book Your Experience** (or your chosen button text)
5. Check:
   - ✅ Confirmation email received at `your-email@example.com`
   - ✅ Admin notification received at `daniel@mindtrails.net`
   - ✅ Page shows success message

---

## Step 7: Monitor & Debug

### View Logs

1. **Lambda Console** → **Monitor** → **View logs in CloudWatch**
2. Look for:
   - `Event received:` (shows form data)
   - `✓ Visitor email sent`
   - `✓ Admin notification sent`

### Common Issues

| Issue | Solution |
|-------|----------|
| **403 Forbidden** | CORS not enabled, or origin mismatch |
| **SES Email Limit** | Only 200 emails/day in sandbox; request production access |
| **Email validation fails** | Phone number format invalid (only numbers + `()#&+*-=.`) |
| **Missing fields** | Form field names must match Lambda expectations |
| **Timeout** | Lambda default is 3 seconds; increase in Configuration → General configuration |

---

## Step 8: Production Checklist

- [ ] SES verified identities for both emails
- [ ] Lambda function URL or API Gateway endpoint created
- [ ] CORS configured for `https://mindtrails.net`
- [ ] HTML form `action` attribute updated
- [ ] Test submission successful (emails received)
- [ ] CloudWatch logs reviewed for errors
- [ ] Lambda timeout increased to 10 seconds (Configuration)
- [ ] IAM role has SES permissions
- [ ] Response handling added to form HTML (optional)

---

## Estimated Costs

- **Lambda:** $0.20 per 1M invocations (Free tier: 1M/month)
- **SES:** $0.10 per 1000 emails (Free tier: 62k/month from EC2)
- **Total for 100 submissions/month:** ~$0.01

---

## Optional: Add JavaScript Response Handling

To show success/error messages on the form, add:

```javascript
<script>
document.querySelector('.elementor-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch(e.target.action, {
      method: 'POST',
      body: new URLSearchParams(formData)
    });
    const data = await response.json();
    
    if (response.ok) {
      alert('✅ ' + data.message);
      e.target.reset();
    } else {
      alert('❌ ' + (data.errors?.join(', ') || data.error));
    }
  } catch (err) {
    alert('❌ Submission failed. Please try again.');
  }
});
</script>
```

---

## Support

For issues:
1. Check CloudWatch logs in Lambda Console
2. Verify SES is not in sandbox mode (if needed)
3. Check CORS settings in API Gateway/Function URL
4. Ensure Lambda role has `AmazonSESFullAccess`
