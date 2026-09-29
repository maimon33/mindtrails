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

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/mindtrails-contact-form"
  retention_in_days = 30

  tags = {
    Name        = "mindtrails-contact-form-logs"
    Environment = var.environment
  }
}

# HTTP API Gateway for contact form
resource "aws_apigatewayv2_api" "contact_form" {
  name          = "mindtrails-contact-form"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://mindtrails.net"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }

  tags = {
    Name        = "mindtrails-contact-form"
    Environment = var.environment
  }
}

# Integration between API Gateway and Lambda
resource "aws_apigatewayv2_integration" "contact_form_lambda" {
  api_id             = aws_apigatewayv2_api.contact_form.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  payload_format_version = "2.0"
  integration_uri    = aws_lambda_function.contact_form.invoke_arn
}

# Route for POST /contact
resource "aws_apigatewayv2_route" "post_contact" {
  api_id    = aws_apigatewayv2_api.contact_form.id
  route_key = "POST /contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact_form_lambda.id}"
}

# Route for OPTIONS /contact (CORS preflight)
resource "aws_apigatewayv2_route" "options_contact" {
  api_id    = aws_apigatewayv2_api.contact_form.id
  route_key = "OPTIONS /contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact_form_lambda.id}"
}

# Stage for prod environment
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.contact_form.id
  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format          = "$context.requestId $context.error.messageString $context.error.message"
  }

  depends_on = [aws_cloudwatch_log_group.api_gateway_logs]

  tags = {
    Name        = "mindtrails-contact-form-prod"
    Environment = "prod"
  }
}
