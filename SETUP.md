# Setup Guide

## Prerequisites

- Git repository on GitHub
- AWS account with S3 bucket
- Cloudflare account with your domain

## 1. GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### `CLOUDFLARE_ZONE_ID`
Found in Cloudflare dashboard for your domain → Overview tab → Zone ID (right sidebar)

### `CLOUDFLARE_API_TOKEN`
Create at Cloudflare → My Profile → API Tokens → Create Token:
- Use "Edit zone cache" template
- Permissions: Zone:Cache Purge
- Zone resources: Include → your domain
- Copy the token value

## 2. AWS OIDC Setup (One-Time)

This allows GitHub to assume an AWS IAM role without storing keys.

### Step 1: Add GitHub as OIDC Provider

```bash
# Run in AWS CLI or CloudShell
# Find your AWS Account ID first: aws sts get-caller-identity
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com"
```

### Step 2: Create IAM Role for GitHub

```bash
# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/mindtrails:ref:refs/heads/main"
        }
      }
    }
  ]
}
EOF

# Replace ACCOUNT_ID and YOUR_GITHUB_USERNAME, then:
aws iam create-role \
  --role-name github-mindtrails-deploy \
  --assume-role-policy-document file://trust-policy.json
```

### Step 3: Add S3 Permissions to Role

```bash
cat > s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mindtrails",
        "arn:aws:s3:::mindtrails/*"
      ]
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name github-mindtrails-deploy \
  --policy-name S3Access \
  --policy-document file://s3-policy.json
```

## 3. Deploy

Now everything is set up:

1. Make changes to files in `content/` folder
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Uploads files to S3
   - Purges Cloudflare cache
   - Changes live in ~30 seconds

## Local Development

```bash
docker-compose up
# Visit http://localhost:8080
```

Edit files in `content/` and refresh browser to see changes.

## Troubleshooting

### Workflow fails with "AccessDenied" or "AssumeRoleUnauthorized"
- Verify the IAM role ARN in `.github/workflows/deploy.yml` is correct
- Confirm OIDC provider is created and visible in IAM → Identity providers
- Check trust policy includes your GitHub repo and branch (e.g., `repo:username/mindtrails:ref:refs/heads/main`)

### Cloudflare cache not purging
- Verify `CLOUDFLARE_ZONE_ID` is correct (should be 32 hex characters)
- Confirm `CLOUDFLARE_API_TOKEN` has "Cache Purge" permission
- Check token is scoped to your domain's zone

### Files not uploading to S3
- Verify S3 bucket name is correct: `s3://mindtrails.net/` (no trailing slash needed in sync command)
- Check bucket exists and is in the correct AWS region
- Run locally to test: `aws s3 ls s3://mindtrails.net/` (requires local AWS credentials configured)
