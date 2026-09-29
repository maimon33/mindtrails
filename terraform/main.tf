# ============================================================================
# Data source: current AWS account ID
# ============================================================================
data "aws_caller_identity" "current" {}

# ============================================================================
# Data source: current AWS region
# ============================================================================
data "aws_region" "current" {}

# ============================================================================
# DynamoDB Table for Rate Limiting & Submission Logs
# ============================================================================
resource "aws_dynamodb_table" "submission_log" {
  name             = "mindtrails-submission-log-${var.environment_name}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "email"
  stream_enabled   = false
  deletion_protect = var.dynamodb_deletion_protection

  attribute {
    name = "email"
    type = "S"
  }

  ttl {
    attribute_name = "expirationTime"
    enabled        = true
  }

  tags = {
    Purpose = "Rate limiting and submission logs"
  }
}

# ============================================================================
# IAM Role for Lambda
# ============================================================================
resource "aws_iam_role" "contact_form_lambda" {
  name = "mindtrails-contact-form-lambda-${var.environment_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Purpose = "Lambda execution role for contact form"
  }
}

# ============================================================================
# IAM Policy: CloudWatch Logs (basic Lambda execution)
# ============================================================================
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.contact_form_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ============================================================================
# IAM Policy: SES SendEmail
# ============================================================================
resource "aws_iam_role_policy_attachment" "lambda_ses_access" {
  role       = aws_iam_role.contact_form_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}

# ============================================================================
# IAM Policy: DynamoDB Rate Limiting Table Access
# ============================================================================
resource "aws_iam_role_policy" "lambda_dynamodb_access" {
  name   = "mindtrails-lambda-dynamodb-${var.environment_name}"
  role   = aws_iam_role.contact_form_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.submission_log.arn
      }
    ]
  })
}

# ============================================================================
# Lambda Function
# ============================================================================
resource "aws_lambda_function" "contact_form" {
  filename      = "${path.module}/../lambda.zip"
  function_name = "mindtrails-contact-form-${var.environment_name}"
  role          = aws_iam_role.contact_form_lambda.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory
  architectures = ["x86_64"]

  environment {
    variables = {
      ADMIN_EMAIL       = var.admin_email
      NOREPLY_EMAIL     = var.noreply_email
      ALLOWED_ORIGIN    = var.allowed_origin
      AWS_REGION        = var.aws_region
      RATE_LIMIT_TABLE  = aws_dynamodb_table.submission_log.name
      RATE_LIMIT_PERIOD = var.rate_limit_period
    }
  }

  source_code_hash = filebase64sha256("${path.module}/../lambda.zip")

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_ses_access,
    aws_iam_role_policy.lambda_dynamodb_access
  ]

  tags = {
    Purpose = "Contact form handler with rate limiting"
  }
}

# ============================================================================
# API Gateway REST API
# ============================================================================
resource "aws_apigateway_rest_api" "contact_form" {
  name        = "mindtrails-contact-form-${var.environment_name}"
  description = "Contact form API with request validation and rate limiting"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Purpose = "Contact form API"
  }
}

# ============================================================================
# API Gateway Resource: /contact
# ============================================================================
resource "aws_apigateway_resource" "contact" {
  rest_api_id = aws_apigateway_rest_api.contact_form.id
  parent_id   = aws_apigateway_rest_api.contact_form.root_resource_id
  path_part   = "contact"
}

# ============================================================================
# API Gateway Request Validator
# ============================================================================
resource "aws_apigateway_request_validator" "contact_form" {
  name                        = "ContactFormValidator"
  rest_api_id                 = aws_apigateway_rest_api.contact_form.id
  validate_request_body       = true
  validate_request_parameters = true
}

# ============================================================================
# API Gateway Method: POST /contact
# ============================================================================
resource "aws_apigateway_method" "contact_post" {
  rest_api_id      = aws_apigateway_rest_api.contact_form.id
  resource_id      = aws_apigateway_resource.contact.id
  http_method      = "POST"
  authorization    = "NONE"
  request_validator_id = aws_apigateway_request_validator.contact_form.id

  request_parameters = {
    "method.request.header.Content-Type" = true
    "method.request.header.Referer"      = false
  }
}

# ============================================================================
# API Gateway Integration: POST -> Lambda
# ============================================================================
resource "aws_apigateway_integration" "contact_post_lambda" {
  rest_api_id      = aws_apigateway_rest_api.contact_form.id
  resource_id      = aws_apigateway_resource.contact.id
  http_method      = aws_apigateway_method.contact_post.http_method
  type             = "AWS_PROXY"
  integration_http_method = "POST"
  uri              = aws_lambda_function.contact_form.invoke_arn
}

# ============================================================================
# API Gateway Method: OPTIONS /contact (CORS Preflight)
# ============================================================================
resource "aws_apigateway_method" "contact_options" {
  rest_api_id   = aws_apigateway_rest_api.contact_form.id
  resource_id   = aws_apigateway_resource.contact.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# ============================================================================
# API Gateway Integration: OPTIONS -> Mock (CORS)
# ============================================================================
resource "aws_apigateway_integration" "contact_options_mock" {
  rest_api_id      = aws_apigateway_rest_api.contact_form.id
  resource_id      = aws_apigateway_resource.contact.id
  http_method      = aws_apigateway_method.contact_options.http_method
  type             = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# ============================================================================
# API Gateway Integration Response: OPTIONS
# ============================================================================
resource "aws_apigateway_integration_response" "contact_options_response" {
  rest_api_id      = aws_apigateway_rest_api.contact_form.id
  resource_id      = aws_apigateway_resource.contact.id
  http_method      = aws_apigateway_method.contact_options.http_method
  status_code      = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origin}'"
  }

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_apigateway_integration.contact_options_mock]
}

# ============================================================================
# API Gateway Method Response: OPTIONS
# ============================================================================
resource "aws_apigateway_method_response" "contact_options_response" {
  rest_api_id = aws_apigateway_rest_api.contact_form.id
  resource_id = aws_apigateway_resource.contact.id
  http_method = aws_apigateway_method.contact_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# ============================================================================
# Lambda Permission for API Gateway
# ============================================================================
resource "aws_lambda_permission" "apigateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact_form.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigateway_rest_api.contact_form.execution_arn}/*/*"
}

# ============================================================================
# CloudWatch Log Group for API Gateway
# ============================================================================
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/mindtrails-contact-form-${var.environment_name}"
  retention_in_days = 7

  tags = {
    Purpose = "API Gateway access logs"
  }
}

# ============================================================================
# IAM Role for API Gateway CloudWatch Logs
# ============================================================================
resource "aws_iam_role" "apigateway_cloudwatch" {
  name = "mindtrails-apigateway-cloudwatch-${var.environment_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Purpose = "API Gateway CloudWatch logging role"
  }
}

# ============================================================================
# IAM Policy for API Gateway CloudWatch Logs
# ============================================================================
resource "aws_iam_role_policy" "apigateway_cloudwatch_logs" {
  name   = "mindtrails-apigateway-cloudwatch-${var.environment_name}"
  role   = aws_iam_role.apigateway_cloudwatch.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.api_gateway.arn}:*"
      }
    ]
  })
}

# ============================================================================
# API Gateway Account (enable logging)
# ============================================================================
resource "aws_api_gateway_account" "contact_form" {
  cloudwatch_role_arn = aws_iam_role.apigateway_cloudwatch.arn

  depends_on = [aws_iam_role_policy.apigateway_cloudwatch_logs]
}

# ============================================================================
# API Gateway Deployment
# ============================================================================
resource "aws_apigateway_deployment" "contact_form" {
  rest_api_id = aws_apigateway_rest_api.contact_form.id
  stage_name  = var.environment_name

  depends_on = [
    aws_apigateway_integration.contact_post_lambda,
    aws_apigateway_integration.contact_options_mock
  ]
}

# ============================================================================
# API Gateway Stage with Throttling
# ============================================================================
resource "aws_apigateway_stage" "contact_form" {
  deployment_id = aws_apigateway_deployment.contact_form.id
  rest_api_id   = aws_apigateway_rest_api.contact_form.id
  stage_name    = var.environment_name

  throttle_settings {
    burst_limit = var.api_throttle_settings.burst_limit
    rate_limit  = var.api_throttle_settings.rate_limit
  }

  dynamic "access_log_settings" {
    for_each = var.enable_api_logging ? [1] : []
    content {
      cloudwatch_log_group_arn = "${aws_cloudwatch_log_group.api_gateway.arn}:*"
      format                   = "$context.requestId $context.extendedRequestId $context.identity.sourceIp $context.requestTime $context.httpMethod $context.resourcePath $context.protocol $context.status $context.responseLength"
    }
  }

  metrics_enabled        = true
  logging_level          = "INFO"
  data_trace_enabled     = false
  tags = {
    Purpose = "Contact form API stage"
  }
}
