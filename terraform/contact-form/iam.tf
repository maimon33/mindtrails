# IAM role for Lambda function handling contact form submissions
resource "aws_iam_role" "lambda_role" {
  name = "mindtrails-contact-form-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWS managed policy for CloudWatch logs
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 access policy for contact form submissions
resource "aws_iam_role_policy" "s3_policy" {
  name = "mindtrails-contact-form-s3-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = aws_s3_bucket.contact_submissions.arn
      },
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.contact_submissions.arn}/submissions/*",
          "${aws_s3_bucket.contact_submissions.arn}/ip-tracking/*"
        ]
      }
    ]
  })
}

# SES send email policy for contact form notifications
resource "aws_iam_role_policy" "ses_policy" {
  name = "mindtrails-contact-form-ses-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   = "Allow"
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = [var.sender_email]
          }
        }
      }
    ]
  })
}
