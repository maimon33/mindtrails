# S3 bucket for contact form submissions
resource "aws_s3_bucket" "contact_submissions" {
  bucket = var.s3_bucket_name
}

# Enable versioning on submissions bucket
resource "aws_s3_bucket_versioning" "contact_submissions" {
  bucket = aws_s3_bucket.contact_submissions.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable AES256 encryption on submissions bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "contact_submissions" {
  bucket = aws_s3_bucket.contact_submissions.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to submissions bucket
resource "aws_s3_bucket_public_access_block" "contact_submissions" {
  bucket = aws_s3_bucket.contact_submissions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Local variable for rate limit (used by Lambda)
locals {
  RATE_LIMIT_MINUTES = var.rate_limit_minutes
  sender_email       = var.sender_email
  admin_email        = var.admin_email
  hcaptcha_secret    = var.hcaptcha_secret_key
  environment        = var.environment
}
