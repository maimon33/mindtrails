output "api_endpoint" {
  description = "API Gateway endpoint URL for contact form"
  value       = "${aws_apigateway_stage.contact_form.invoke_url}/contact"
}

output "api_endpoint_base" {
  description = "Base API Gateway endpoint URL (without /contact path)"
  value       = aws_apigateway_stage.contact_form.invoke_url
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.contact_form.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.contact_form.arn
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB rate limiting table"
  value       = aws_dynamodb_table.submission_log.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB rate limiting table"
  value       = aws_dynamodb_table.submission_log.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch Log Group for API Gateway"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

output "rate_limit_period_seconds" {
  description = "Rate limit period in seconds"
  value       = var.rate_limit_period
}

output "rate_limit_period_label" {
  description = "Human-readable rate limit period"
  value       = var.rate_limit_period == 3600 ? "1 hour" : var.rate_limit_period == 86400 ? "1 day" : "${var.rate_limit_period} seconds"
}
