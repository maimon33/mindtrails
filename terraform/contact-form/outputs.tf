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
  value       = aws_lambda_function.contact_form.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.contact_form.arn
}

output "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.contact_form.invoke_arn
}

output "sender_email" {
  description = "Email address used as sender for contact form notifications"
  value       = var.sender_email
  sensitive   = true
}
