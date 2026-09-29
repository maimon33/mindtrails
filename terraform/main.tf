# ============================================================================
# Contact Form Module
# ============================================================================
module "contact_form" {
  source = "./contact-form"

  admin_email          = var.admin_email
  hcaptcha_secret_key  = var.hcaptcha_secret_key
  s3_bucket_name       = var.s3_bucket_name
  rate_limit_minutes   = var.rate_limit_minutes
  sender_email         = var.sender_email
  environment          = var.environment
}
