# Lambda + API Gateway - GitHub Actions Deployment

This guide explains the **Infrastructure as Code** setup using CloudFormation and GitHub Actions.

---

## Architecture

```
GitHub Repository
    ↓ (push to main)
GitHub Actions Workflow (deploy-lambda.yml)
    ↓ (uses OIDC)
AWS CloudFormation (template.yaml)
    ↓ (creates)
├─ Lambda Function
├─ IAM Role (with SES permissions)
├─ API Gateway REST API
├─ Request Validator (Content-Type, Referer)
├─ POST /contact endpoint
├─ OPTIONS endpoint (CORS preflight)
└─ CloudWatch Alarms (error rate, DoS detection)
```

---

## Setup: GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

| Secret | Value | Example |
|--------|-------|---------|
| `MINDTRAILS_DOMAIN_URL` | Your site domain (CORS origin) | `https://mindtrails.net` |
| `MINDTRAILS_ADMIN_EMAIL` | Admin email for inquiry copies | `daniel@mindtrails.net` |
| `MINDTRAILS_NOREPLY_EMAIL` | Sender email (must be SES verified) | `noreply@mindtrails.net` |

**Note:** The OIDC role `maimons-infra-github-ssm` is already configured in your AWS account (from previous setup).

---

## Deployment Steps

### 1. Add GitHub Secrets

```bash
# Via GitHub CLI (if you have it)
gh secret set MINDTRAILS_DOMAIN_URL --body "https://mindtrails.net"
gh secret set MINDTRAILS_ADMIN_EMAIL --body "daniel@mindtrails.net"
gh secret set MINDTRAILS_NOREPLY_EMAIL --body "noreply@mindtrails.net"
```

Or manually:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret above

### 2. Verify SES Emails (One-Time)

Before deploying, ensure emails are verified in SES:

1. Go to **AWS Console** → **SES** → **Verified identities**
2. Verify:
   - `daniel@mindtrails.net` (admin)
   - `noreply@mindtrails.net` (sender)
3. Click each → verify via email link

**Note:** If you need to send to unverified emails, request **SES Production Access** (24h approval).

### 3. Deploy

Push to `main` to trigger deployment:

```bash
git push origin main
```

This automatically:
- ✅ Validates CloudFormation template
- ✅ Packages Lambda function
- ✅ Deploys/updates stack (creates API Gateway endpoint)
- ✅ Outputs API endpoint URL

**Check deployment:**
1. Go to **GitHub** → **Actions**
2. Click the `Deploy Lambda + API Gateway` workflow
3. Look for the API endpoint in the workflow output
4. Example: `https://abc123xyz.execute-api.eu-central-1.amazonaws.com/prod/contact`

### 4. Update Form HTML

Update the form in `content/index.html`:

**Find:**
```html
<form class="elementor-form" method="post" name="Contact Us" aria-label="Contact Us">
```

**Replace with:**
```html
<form class="elementor-form" method="POST" 
      action="https://YOUR_API_GATEWAY_ENDPOINT/contact"
      enctype="application/x-www-form-urlencoded">
```

**Example (replace with actual endpoint from workflow):**
```html
<form class="elementor-form" method="POST" 
      action="https://abc123xyz.execute-api.eu-central-1.amazonaws.com/prod/contact"
      enctype="application/x-www-form-urlencoded">
```

### 5. Add Honeypot Field

Add this hidden field to the form (for spam prevention):

```html
<!-- Hidden from real users (Layer 1: Bot prevention) -->
<input type="text" name="website" style="display:none;" />

<!-- Add before the submit button -->
<button type="submit">Book Your Experience</button>
```

**Full form example:**
```html
<form class="elementor-form" method="POST" 
      action="https://your-endpoint.execute-api.eu-central-1.amazonaws.com/prod/contact"
      enctype="application/x-www-form-urlencoded">
  
  <!-- Existing fields -->
  <input name="form_fields[name]" type="text" required />
  <input name="form_fields[email]" type="email" required />
  <input name="form_fields[field_7525a0a]" type="tel" required />
  <textarea name="form_fields[message]" required></textarea>
  
  <!-- Honeypot (hidden) -->
  <input type="text" name="website" style="display:none;" />
  
  <button type="submit">Book Your Experience</button>
</form>
```

---

## What's Deployed

### CloudFormation Stack

The `template.yaml` defines:

| Resource | Purpose |
|----------|---------|
| **Lambda Function** | Processes form submissions, validates, sends emails via SES |
| **IAM Role** | Permissions for Lambda to call SES + CloudWatch Logs |
| **API Gateway REST API** | Public HTTPS endpoint for form submissions |
| **Request Validator** | Validates Content-Type and Referer headers (Layer 3) |
| **POST /contact** | Form submission endpoint with CORS |
| **OPTIONS /contact** | CORS preflight endpoint |
| **CloudWatch Alarms** | Monitor error rate and invocation rate (DoS detection) |

### Security Layers

| Layer | Mechanism | Effect |
|-------|-----------|--------|
| **Layer 1** | Honeypot field (hidden input) | Stops 95% of spam bots |
| **Layer 2** | Rate limiting (CloudWatch alarm) | Triggers on >100 invocations/min |
| **Layer 3** | Request validation (API Gateway) | Validates Content-Type and Referer headers |

---

## Configuration Changes

To update the deployment, edit:

- **`template.yaml`** — CloudFormation stack definition (Lambda, API Gateway, IAM)
- **`lambda/handler.js`** — Lambda function code
- **GitHub Secrets** — Email addresses, domain, etc.

**Example: Change admin email**
1. Update GitHub Secret `MINDTRAILS_ADMIN_EMAIL`
2. Push to `main`
3. Workflow redeploys with new email

---

## Monitoring

### Check CloudWatch Logs

1. **AWS Console** → **CloudWatch** → **Log Groups**
2. `/aws/lambda/mindtrails-contact-form-prod` — Lambda logs
3. `/aws/apigateway/mindtrails-prod` — API Gateway logs

### Check Alarms

1. **AWS Console** → **CloudWatch** → **Alarms**
2. Look for:
   - `mindtrails-form-high-error-rate-prod` (>10 errors/5min)
   - `mindtrails-form-high-invocation-prod` (>100 invocations/min)

### Test Form Submission

1. Fill out contact form on live site
2. Check CloudWatch Logs for:
   - `Request from IP: xxx`
   - `✓ Visitor email sent`
   - `✓ Admin notification sent`
3. Verify emails received

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Deployment fails with "AccessDenied"** | Check OIDC role ARN is correct in `deploy-lambda.yml` |
| **Emails not sending** | Verify addresses in SES console; check env vars in Lambda |
| **Form returns 403** | Check Referer header and Content-Type in request; enable CORS |
| **Rate limit alarm triggers** | Either normal traffic surge or potential DoS; check logs |
| **CloudFormation stack won't update** | Ensure no manual edits to AWS resources; only change via `template.yaml` |

---

## Cost Estimate

| Service | Estimate |
|---------|----------|
| Lambda | $0.20/1M invocations (free tier: 1M/month) |
| API Gateway | $3.50/1M requests (free tier: 1M/month) |
| CloudWatch | $0.50/GB logs (free tier: 5GB/month) |
| **Total for 100 submissions/month** | **~$0.01** |

---

## Next Steps

1. ✅ Add GitHub Secrets
2. ✅ Verify SES emails
3. ✅ Push to `main` (triggers deployment)
4. ✅ Copy API endpoint from workflow output
5. ✅ Update form `action` in `content/index.html`
6. ✅ Add honeypot field
7. ✅ Test form submission
8. ✅ Deploy site to S3 (`git push` to main)

---

## File Reference

| File | Purpose |
|------|---------|
| `template.yaml` | CloudFormation stack (IaC) |
| `lambda/handler.js` | Lambda function code |
| `.github/workflows/deploy-lambda.yml` | GitHub Actions deployment workflow |
| `content/index.html` | Contact form (update `action` attribute) |
| `LAMBDA_GITHUB_ACTIONS.md` | This file |
