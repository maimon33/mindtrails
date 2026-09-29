variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"

  validation {
    condition     = contains(["us-east-1", "us-west-2", "eu-west-1", "eu-central-1"], var.aws_region)
    error_message = "Region must be one that supports SES: us-east-1, us-west-2, eu-west-1, or eu-central-1."
  }
}

variable "environment_name" {
  description = "Environment name (prod, staging, etc)"
  type        = string
  default     = "prod"
}

variable "allowed_origin" {
  description = "CORS allowed origin (no trailing slash)"
  type        = string
  default     = "https://mindtrails.net"
}

variable "admin_email" {
  description = "Admin email for inquiry notifications"
  type        = string
  sensitive   = true
}

variable "noreply_email" {
  description = "No-reply sender email (must be SES verified)"
  type        = string
  sensitive   = true
}

variable "rate_limit_period" {
  description = "Rate limit period in seconds (3600 = 1 hour, 86400 = 1 day)"
  type        = number
  default     = 3600

  validation {
    condition     = var.rate_limit_period >= 60 && var.rate_limit_period <= 604800
    error_message = "Rate limit period must be between 60 and 604800 seconds."
  }
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 10

  validation {
    condition     = var.lambda_timeout >= 3 && var.lambda_timeout <= 900
    error_message = "Lambda timeout must be between 3 and 900 seconds."
  }
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 256

  validation {
    condition     = contains([128, 256, 512, 1024, 1536, 2048, 2560, 3008], var.lambda_memory)
    error_message = "Lambda memory must be one of the standard AWS values (128, 256, 512, 1024, 1536, 2048, 2560, 3008)."
  }
}

variable "api_throttle_settings" {
  description = "API Gateway throttling settings"
  type = object({
    burst_limit = number
    rate_limit  = number
  })
  default = {
    burst_limit = 100
    rate_limit  = 50
  }
}

variable "enable_api_logging" {
  description = "Enable API Gateway CloudWatch logging"
  type        = bool
  default     = true
}

variable "dynamodb_deletion_protection" {
  description = "Enable deletion protection on DynamoDB table"
  type        = bool
  default     = true
}
