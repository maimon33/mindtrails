terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state backend (S3 + KMS encryption)
  backend "s3" {
    bucket       = "maimons-infra-tfstate"
    key          = "platform/prod/mindtrails-contact-form.tfstate"
    region       = "eu-central-1"
    kms_key_id   = "arn:aws:kms:eu-central-1:236565801201:key/478d49a7-7653-4509-bba0-8bd0593e3e8b"
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Application = "MindTrails"
      Environment = var.environment_name
      ManagedBy   = "Terraform"
    }
  }
}
