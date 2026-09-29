# Contact Form Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy the MindTrails contact form infrastructure on AWS using Terraform.

## Prerequisites

Before starting deployment, ensure you have:

### 1. AWS Account and Credentials

- An AWS account with sufficient permissions
- AWS CLI configured locally with appropriate credentials
- Access to eu-central-1 region (or update region in configuration)
- Permissions for:
  - Lambda
  - API Gateway
  - S3
  - SES (Simple Email Service)
  - IAM
  - CloudWatch

### 2. hCaptcha Account

- hCaptcha account created at https://www.hcaptcha.com
- hCaptcha sitekey (public key)
- hCaptcha secret key (private key)

### 3. Email Addresses

- **Sender Email**: Email address to use for sending notifications (e.g., contact@mindtrails.net)
  - Must have domain access for verification
- **Admin Email**: Email address to receive contact form submissions

### 4. AWS SES Email Verification

- AWS SES sandbox access (default) or production access requested
- Both sender and admin emails verified in AWS SES

### 5. Terraform

- Terraform installed (version 1.0 or higher)
- Terraform configured for AWS provider

## Step 1: Set Up hCaptcha

### 1.1 Create hCaptcha Site

1. Go to https://www.hcaptcha.com
2. Click "Sign up" and create an account
3. Verify your email address
4. In the dashboard, click "New Site"
5. Enter:
   - **Hostname**: `mindtrails.net`
   - **CAPTCHA type**: Keep default (hCaptcha)
6. Click "Create"
7. Copy and save:
   - **Sitekey**: This is your public key for the frontend
   - **Secret Key**: This is your private key for the backend

### 1.2 Note the Keys

You'll need these values when creating Terraform variables:

```
HCAPTCHA_SITEKEY = "xxx...xxx"  # Frontend
HCAPTCHA_SECRET_KEY = "yyy...yyy"  # Backend (sensitive)
```

## Step 2: Verify SES Email Addresses

### 2.1 Sender Email Verification

1. Log in to AWS Management Console
2. Navigate to Simple Email Service (SES) → Verified identities
3. Click "Create identity" (or "Verify a New Email Address")
4. Select "Email address" as identity type
5. Enter sender email: `contact@mindtrails.net`
6. Click "Create identity"
7. AWS sends verification email to that address
8. Open the email and click the verification link
9. Status should show **Verified** in SES console

### 2.2 Admin Email Verification

Repeat the same process for your admin email address (e.g., admin@example.com)

### 2.3 Request Production Access (Recommended)

By default, SES starts in sandbox mode with limitations. For production:

1. In SES console, click "Account dashboard"
2. Look for "Sandbox status" section
3. Click "Request production access"
4. Fill out the form:
   - **Email use case**: "Contact form notifications"
   - **Website URL**: `https://mindtrails.net`
   - **Description**: Describe your contact form purpose
5. Submit request
6. AWS reviews (typically 24 hours)
7. Once approved, production access is enabled

**For testing in sandbox**: Skip production access, but you can only send emails to verified addresses.

## Step 3: Create Terraform Variables

### 3.1 Navigate to Terraform Directory

```bash
cd /path/to/mindtrails/terraform/contact-form
```

### 3.2 Create terraform.tfvars File

Create a new file `terraform.tfvars` in the `terraform/contact-form` directory:

```bash
cat > terraform.tfvars << 'EOF'
# Admin email address (receives contact form submissions)
admin_email = "admin@example.com"

# hCaptcha secret key (from hCaptcha dashboard)
hcaptcha_secret_key = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# S3 bucket name for storing submissions (must be globally unique)
s3_bucket_name = "mindtrails-contact-submissions-prod"

# Rate limit in minutes (default 60 = 1 submission per hour per IP)
rate_limit_minutes = 60

# Sender email address (must be verified in SES)
sender_email = "contact@mindtrails.net"

# Environment name
environment = "prod"
EOF
```

Replace:
- `admin@example.com` with your admin email
- `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your hCaptcha secret key
- `mindtrails-contact-submissions-prod` with a globally unique S3 bucket name
- `contact@mindtrails.net` with your sender email

### 3.3 Secure Sensitive Data

Keep `terraform.tfvars` out of version control:

```bash
echo "terraform.tfvars" >> .gitignore
```

## Step 4: Initialize Terraform

### 4.1 Download Providers

```bash
cd /path/to/mindtrails/terraform/contact-form
terraform init
```

This downloads the AWS provider and initializes Terraform state.

### 4.2 Verify Initialization

Check that `.terraform` directory was created:

```bash
ls -la .terraform/
```

## Step 5: Plan Deployment

### 5.1 Review Changes

```bash
terraform plan -out=tfplan
```

This command:
- Reads your Terraform configuration
- Checks your AWS credentials
- Lists all resources that will be created
- Saves the plan to `tfplan` file for safe application

### 5.2 Review the Plan Output

Look for:
- Lambda function creation
- API Gateway resources (REST API, /contact resource, POST/OPTIONS methods)
- S3 bucket for submissions
- IAM roles and policies
- SES identity and DKIM configuration

If anything looks incorrect, edit `terraform.tfvars` and run `terraform plan` again.

## Step 6: Deploy Infrastructure

### 6.1 Apply Terraform Configuration

```bash
terraform apply tfplan
```

This will:
- Create all resources defined in the plan
- Display completion status
- Output the API endpoint URL and other resource identifiers

Expected output includes:
```
Outputs:
api_endpoint_url = "https://api.mindtrails.net/contact"
s3_bucket_name = "mindtrails-contact-submissions-prod"
lambda_function_name = "mindtrails-contact-form"
sender_email = "contact@mindtrails.net"
```

### 6.2 Save Terraform State

The `terraform.tfstate` file contains the current state. Keep it safe:

```bash
# Store in secure location (or use remote state with S3 backend)
# Never commit to version control
echo "terraform.tfstate*" >> .gitignore
```

## Step 7: Save Deployment Outputs

### 7.1 Retrieve Outputs

```bash
terraform output
```

This displays:
- API endpoint URL
- S3 bucket name
- Lambda function name
- Lambda ARN

### 7.2 Save Outputs to File

```bash
terraform output > ../contact-form-deployment-outputs.txt
```

Store this file securely for reference.

## Step 8: Testing Checklist

After deployment, verify functionality with this checklist:

- [ ] **API Endpoint Accessible**: Test that the API endpoint is reachable
  ```bash
  curl -X OPTIONS https://api.mindtrails.net/contact
  ```

- [ ] **Sender Email Verified**: Confirm sender email shows as verified in SES console

- [ ] **Admin Email Verified**: Confirm admin email shows as verified in SES console

- [ ] **CORS Working**: Verify CORS preflight request succeeds
  ```bash
  curl -X OPTIONS https://api.mindtrails.net/contact \
    -H "Origin: https://mindtrails.net"
  ```

- [ ] **Validation Working**: Test with invalid data (should return 400)
  ```bash
  curl -X POST https://api.mindtrails.net/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test"}'
  ```

- [ ] **S3 Bucket Created**: Verify S3 bucket exists
  ```bash
  aws s3 ls s3://mindtrails-contact-submissions-prod/
  ```

- [ ] **Lambda Function Deployed**: Verify Lambda function exists
  ```bash
  aws lambda get-function --function-name mindtrails-contact-form
  ```

- [ ] **CloudWatch Logs Available**: Check Lambda logs
  ```bash
  aws logs describe-log-groups --log-group-name-prefix /aws/lambda/mindtrails-contact-form
  ```

- [ ] **Test Email Sending**: Submit a valid form with real hCaptcha token and verify both confirmation and admin emails are received

## Step 9: Monitoring Setup

### 9.1 CloudWatch Logs

Monitor Lambda execution logs:

```bash
# Watch recent logs
aws logs tail /aws/lambda/mindtrails-contact-form --follow
```

### 9.2 CloudWatch Metrics

View API metrics in AWS Console:
1. Go to CloudWatch → Metrics → API Gateway
2. Look for your API name
3. Monitor:
   - Request count
   - Error rate
   - Latency
   - Integration latency

### 9.3 S3 Submissions

View stored submissions:

```bash
aws s3 ls s3://mindtrails-contact-submissions-prod/ --recursive
```

## Troubleshooting

### Issue: Terraform Plan Fails with "Access Denied"

**Cause**: AWS credentials not configured or lacking permissions

**Solution**:
1. Verify AWS credentials: `aws sts get-caller-identity`
2. Ensure IAM user has permissions for Lambda, API Gateway, S3, SES, IAM
3. Re-configure AWS CLI: `aws configure`

### Issue: S3 Bucket Name Already Taken

**Cause**: S3 bucket names must be globally unique

**Solution**:
1. Change S3 bucket name in `terraform.tfvars`
2. Use a unique suffix, e.g., `mindtrails-contact-submissions-prod-12345`
3. Run `terraform plan` again

### Issue: Email Verification Stuck in Pending

**Cause**: Verification email not received

**Solution**:
1. Check spam/junk folder
2. Verify email address is correct in SES console
3. Re-send verification email from SES console
4. Wait 5-10 minutes for email delivery

### Issue: DKIM Verification Failing

**Cause**: CNAME records not properly created in DNS

**Solution**:
1. Retrieve DKIM tokens: `terraform output dkim_tokens`
2. Add CNAME records to your DNS provider
3. Verify record format: `[token]._domainkey.mindtrails.net`
4. Wait 5-30 minutes for DNS propagation
5. Check SES console to verify DKIM records

### Issue: Lambda Function Returns 500 Error

**Cause**: Lambda execution error

**Solution**:
1. Check CloudWatch logs for error details
2. Verify environment variables are set correctly
3. Ensure SES has production access (if sending to unverified addresses)
4. Verify S3 bucket permissions

### Issue: API Gateway Returns 403 Forbidden

**Cause**: Lambda permission not granted to API Gateway

**Solution**:
1. Verify Lambda permission exists: `terraform output lambda_function_invoke_arn`
2. Check API Gateway resource integration settings
3. Re-run: `terraform plan` and `terraform apply`

## Updating Deployment

To update the contact form configuration:

1. Edit `terraform.tfvars` with new values
2. Run `terraform plan` to review changes
3. Run `terraform apply tfplan` to apply changes
4. Verify changes in AWS console

## Destroying Deployment

To remove all deployed resources:

```bash
terraform destroy
```

**Warning**: This permanently deletes all resources including the S3 bucket with stored submissions.

## Production Checklist

- [ ] AWS SES verified for both sender and admin emails
- [ ] AWS SES production access requested and approved
- [ ] hCaptcha site created and keys configured
- [ ] Terraform variables configured securely
- [ ] Deployment tested successfully
- [ ] CloudWatch monitoring configured
- [ ] S3 bucket and data retention policies reviewed
- [ ] Admin email notifications verified
- [ ] Frontend integration completed
- [ ] CORS settings verified for correct domain
- [ ] Rate limiting configured appropriately
- [ ] Error handling and user feedback tested
- [ ] Security audit completed

## Support and References

- AWS Lambda Documentation: https://docs.aws.amazon.com/lambda/
- AWS API Gateway Documentation: https://docs.aws.amazon.com/apigateway/
- AWS SES Documentation: https://docs.aws.amazon.com/ses/
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- hCaptcha Documentation: https://docs.hcaptcha.com/
