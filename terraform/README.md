# MindTrails Contact Form Infrastructure (Terraform)

Terraform configuration for deploying the Lambda-based contact form with rate limiting, API Gateway, and DynamoDB.

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with credentials
- AWS SES verified sender emails (both admin and noreply)

## Setup

1. **Install Terraform** (if not already installed)
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads.html
   ```

2. **Copy and configure variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Verify configuration**
   ```bash
   terraform plan
   ```

5. **Apply configuration**
   ```bash
   terraform apply
   ```

## Outputs

After deployment, Terraform will output:
- `api_endpoint` — Full URL for your contact form endpoint
- `lambda_function_name` — Lambda function name
- `dynamodb_table_name` — Rate limiting table name
- `rate_limit_period_label` — Human-readable rate limit (e.g., "1 hour")

Example output:
```
api_endpoint = "https://abc123.execute-api.us-east-1.amazonaws.com/prod/contact"
```

Update your form's action attribute with this endpoint.

## Variables

See `variables.tf` for full documentation. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `aws_region` | `us-east-1` | AWS region (must support SES) |
| `admin_email` | (required) | Admin notification email |
| `noreply_email` | (required) | Sender email (must be SES verified) |
| `rate_limit_period` | `3600` | Seconds between submissions per email |
| `lambda_memory` | `256` | Lambda memory in MB |
| `enable_api_logging` | `true` | CloudWatch logging for API Gateway |

## State Management

### Local State (Default)
State stored in `.terraform/terraform.tfstate`. Good for single-user development.

### Remote State (Production)
To use S3 + DynamoDB for remote state:

1. Create S3 bucket and DynamoDB lock table
2. Uncomment backend config in `versions.tf`:
   ```hcl
   backend "s3" {
     bucket         = "your-terraform-state-bucket"
     key            = "contact-form/terraform.tfstate"
     region         = "us-east-1"
     dynamodb_table = "terraform-locks"
     encrypt        = true
   }
   ```
3. Run `terraform init`

## Common Commands

```bash
# View planned changes
terraform plan

# Apply configuration
terraform apply

# Destroy all resources
terraform destroy

# Format code
terraform fmt -recursive

# Validate syntax
terraform validate

# Show current state
terraform show

# Output specific value
terraform output api_endpoint
```

## Updating Rate Limiting

To change the rate limit period (e.g., from 1 hour to 1 day):

```bash
# Edit terraform.tfvars
rate_limit_period = 86400  # 1 day

# Apply changes
terraform plan
terraform apply
```

No infrastructure recreation needed — only the Lambda environment variable is updated.

## Troubleshooting

### "User is not authorized to perform: cloudformation:CreateChangeSet"
This is a CloudFormation error (not Terraform). You're not using CloudFormation — Terraform manages resources directly via AWS APIs.

### "InvalidAction: Invalid action used in policy: 'ses:*'"
Ensure your IAM role has `AmazonSESFullAccess` policy attached.

### DynamoDB table already exists
If `terraform destroy` fails because the table has deletion protection, disable it:
```bash
terraform apply -var="dynamodb_deletion_protection=false"
terraform destroy
```

## GitHub Actions Integration

See `.github/workflows/deploy-lambda.yml` for CI/CD setup that:
1. Validates Terraform
2. Plans changes
3. Applies on push to main

## Support

For AWS SES issues:
- [AWS SES Console](https://console.aws.amazon.com/ses/)
- Check sender addresses are verified
- Verify DKIM/SPF if production mailing needed
