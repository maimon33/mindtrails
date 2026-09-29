terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment for remote state backend (S3 + DynamoDB)
  # backend "s3" {
  #   bucket         = "mindtrails-terraform-state"
  #   key            = "contact-form/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
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
