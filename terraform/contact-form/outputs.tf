output "api_endpoint_url" {
  description = "API Gateway endpoint URL for contact form submissions"
  value       = "https://api.mindtrails.net/contact"
}

output "s3_bucket_name" {
  description = "S3 bucket name for storing contact form submissions"
  value       = aws_s3_bucket.contact_submissions.id
}

output "lambda_function_name" {
  description = "Name of the Lambda function handling contact form submissions"
  value       = "mindtrails-contact-form-handler"
}

output "sender_email" {
  description = "Email address used as sender for contact form notifications"
  value       = var.sender_email
  sensitive   = true
}
