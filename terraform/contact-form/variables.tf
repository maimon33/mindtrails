variable "admin_email" {
  description = "Admin email address for contact form notifications"
  type        = string
  sensitive   = true

  validation {
    condition = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.admin_email))
    error_message = "Admin email must be a valid email address matching pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }
}

variable "hcaptcha_secret_key" {
  description = "hCaptcha secret key for form submission validation"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name for storing contact form submissions"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.s3_bucket_name)) && length(var.s3_bucket_name) >= 3 && length(var.s3_bucket_name) <= 63
    error_message = "S3 bucket name must be between 3 and 63 characters, start and end with alphanumeric characters, and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "rate_limit_minutes" {
  description = "Rate limit period in minutes (60 = 1 hour)"
  type        = number
  default     = 60

  validation {
    condition     = var.rate_limit_minutes >= 1 && var.rate_limit_minutes <= 1440
    error_message = "Rate limit must be between 1 and 1440 minutes."
  }
}

variable "sender_email" {
  description = "Email address to use as sender for contact form notifications"
  type        = string
  default     = "contact@mindtrails.net"
  sensitive   = true

  validation {
    condition = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.sender_email))
    error_message = "Sender email must be a valid email address matching pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "Environment must be one of: prod, staging, dev."
  }
}
