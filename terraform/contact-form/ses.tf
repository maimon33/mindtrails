# SES email identity for sender
resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

# SES email identity for admin
resource "aws_ses_email_identity" "admin" {
  email = var.admin_email
}

# DKIM configuration for mindtrails.net domain
resource "aws_ses_domain_dkim" "mindtrails" {
  domain = "mindtrails.net"
}

# Output DKIM tokens for DNS configuration
output "dkim_tokens" {
  description = "DKIM tokens required for DNS configuration"
  value       = aws_ses_domain_dkim.mindtrails.dkim_tokens
}

output "sender_identity_arn" {
  description = "ARN of the sender email identity"
  value       = aws_ses_email_identity.sender.arn
}

output "admin_identity_arn" {
  description = "ARN of the admin email identity"
  value       = aws_ses_email_identity.admin.arn
}
