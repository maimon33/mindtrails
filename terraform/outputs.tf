output "api_endpoint_url" {
  description = "API Gateway endpoint URL for contact form submissions"
  value       = module.contact_form.api_endpoint_url
}

output "s3_bucket_name" {
  description = "S3 bucket name for storing contact form submissions"
  value       = module.contact_form.s3_bucket_name
}

output "lambda_function_name" {
  description = "Name of the Lambda function handling contact form submissions"
  value       = module.contact_form.lambda_function_name
}

output "sender_email" {
  description = "Email address used as sender for contact form notifications"
  value       = module.contact_form.sender_email
  sensitive   = true
}
