# Archive Lambda function code
data "archive_file" "contact_form_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambda/contact-form"
  output_path = "${path.module}/contact_form.zip"
}

# Lambda function for handling contact form submissions
resource "aws_lambda_function" "contact_form" {
  filename            = data.archive_file.contact_form_zip.output_path
  function_name       = "mindtrails-contact-form"
  role                = aws_iam_role.lambda_role.arn
  handler             = "index.handler"
  runtime             = "nodejs20.x"
  memory_size         = 256
  timeout             = 30
  source_code_hash    = data.archive_file.contact_form_zip.output_base64sha256

  environment {
    variables = {
      HCAPTCHA_SECRET_KEY  = var.hcaptcha_secret_key
      ADMIN_EMAIL          = var.admin_email
      SES_FROM_EMAIL       = var.sender_email
      S3_BUCKET_NAME       = aws_s3_bucket.contact_submissions.id
      RATE_LIMIT_SECONDS   = var.rate_limit_minutes * 60
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_iam_role_policy.s3_policy,
    aws_iam_role_policy.ses_policy
  ]
}

# Permission to allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact_form.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}
