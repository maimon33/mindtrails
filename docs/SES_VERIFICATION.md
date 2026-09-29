# SES Email Identity Verification

This document outlines the manual verification steps required to complete the SES (Simple Email Service) email identity setup for the MindTrails contact form infrastructure.

## Overview

The Terraform configuration creates two email identities:
- **Sender Email**: `contact@mindtrails.net` (used to send contact form notifications)
- **Admin Email**: Retrieved from `var.admin_email` (receives contact form submissions)

Two verification methods are available:
1. **Email Verification** (quick but less secure)
2. **Domain Verification with DKIM** (recommended for production)

## SES Sandbox vs Production Access

### Sandbox Environment

By default, AWS SES accounts start in **sandbox mode**. This mode has limitations:
- Can only send emails to verified email addresses
- Can only send emails from verified email addresses
- Daily sending quota is 200 emails
- Maximum send rate is 1 email per second

**Current Status**: The MindTrails contact form is deployed to the `eu-central-1` region, which starts in sandbox mode.

### Production Access

To move to production:
1. Request production access from AWS
2. Provide a description of your email use case
3. AWS reviews and approves (typically within 24 hours)
4. Once approved, you can send to any email address

## Email Verification Steps

### Step 1: Verify Sender Email

1. Log in to the AWS Management Console
2. Navigate to **Simple Email Service** (SES)
3. Ensure region is set to **eu-central-1**
4. Go to **Verified identities** or **Email Addresses** (depending on console version)
5. Click **Create identity** or **Verify a New Email Address**
6. Enter `contact@mindtrails.net`
7. Click **Verify This Email Address**
8. AWS sends a verification email to `contact@mindtrails.net`
9. Open the email and click the verification link
10. Verification is complete when status shows **Verified**

### Step 2: Verify Admin Email

Repeat the same process for `var.admin_email`:

1. Go to **Verified identities** in SES console
2. Click **Create identity**
3. Enter the admin email address from `var.admin_email`
4. Click **Verify This Email Address**
5. Open the verification email sent to the admin address
6. Click the verification link
7. Verification is complete when status shows **Verified**

## Domain Verification with DKIM (Recommended)

### Step 1: Retrieve DKIM Tokens

The Terraform configuration automatically creates DKIM records. To retrieve the DKIM tokens:

```bash
cd terraform/contact-form
terraform apply
terraform output dkim_tokens
```

This will output 3 DKIM tokens, each consisting of a string like: `token.dkim.amazonses.com`

### Step 2: Add DKIM Records to DNS

For each DKIM token, create a CNAME record in your DNS provider:

**Example CNAME Records** (replace with actual tokens):

```
Token 1: xxxxx._domainkey.mindtrails.net → xxxxx.dkim.amazonses.com
Token 2: yyyyy._domainkey.mindtrails.net → yyyyy.dkim.amazonses.com
Token 3: zzzzz._domainkey.mindtrails.net → zzzzz.dkim.amazonses.com
```

**Steps:**
1. Log in to your DNS provider (e.g., Route 53, Namecheap, GoDaddy)
2. For each DKIM token, create a CNAME record:
   - **Name**: `[token]._domainkey.mindtrails.net`
   - **Value**: `[token].dkim.amazonses.com`
3. Save the records
4. Wait for DNS propagation (typically 5-30 minutes)

### Step 3: Verify DKIM Configuration

In the AWS SES console:

1. Go to **Verified identities**
2. Click on **mindtrails.net**
3. Scroll to **DKIM signing**
4. Check that all 3 DKIM records show **Verified**
5. Once verified, DKIM signing is enabled for all emails from the domain

## Email Verification Troubleshooting

### Verification Email Not Received

- Check spam/junk folder
- Ensure the email address is spelled correctly in Terraform variables
- Re-send the verification email from SES console
- Verify that the email provider isn't blocking AWS SES servers

### DKIM Verification Failing

- Ensure CNAME records are created correctly (check for typos)
- Wait longer for DNS propagation (up to 48 hours in rare cases)
- Verify the token values match exactly
- Check that records are created as CNAME, not A records
- In Route 53: ensure records are in the correct hosted zone

## Sending Test Email

Once identities are verified, test sending an email:

```bash
# Using AWS CLI
aws ses send-email \
  --region eu-central-1 \
  --from contact@mindtrails.net \
  --to admin@example.com \
  --subject "Test Email" \
  --text "This is a test email from MindTrails SES"
```

## Checklist for Deployment

- [ ] Sender email (`contact@mindtrails.net`) verified in SES
- [ ] Admin email verified in SES
- [ ] DKIM tokens added to DNS (3 CNAME records)
- [ ] All DKIM records showing **Verified** in SES console
- [ ] Test email successfully sent from sender to admin email
- [ ] Request production access if not in sandbox mode
- [ ] Update Lambda environment variables (if needed)
- [ ] Verify SES sending permissions in IAM policy

## References

- [AWS SES Verified Identities](https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html)
- [AWS SES DKIM Setup](https://docs.aws.amazon.com/ses/latest/dg/email-authentication-dkim.html)
- [AWS SES Sandbox Mode](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [DKIM with Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-ses.html)
