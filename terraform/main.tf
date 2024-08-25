provider "aws" {
  region = "us-east-1"
}

# Generate a unique suffix for the bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Define S3 bucket for CodePipeline artifacts
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket = "unique-bucket-name-${random_id.bucket_suffix.hex}"  # Ensure the bucket name is unique
}

# Define ECR public repository for images
resource "aws_ecrpublic_repository" "hash_service" {
  repository_name = "hash-service"
}

# Reference the existing IAM role for CodeBuild
data "aws_iam_role" "codebuild_service_role" {
  name = "admin"
}

# Define CodeBuild project
resource "aws_codebuild_project" "hash_service_build" {
  name          = "hash-service-build"
  description   = "CodeBuild project for hash-service"
  build_timeout = "60"

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:5.0"
    type         = "LINUX_CONTAINER"

    environment_variable {
      name  = "REPOSITORY_URL"
      value = aws_ecrpublic_repository.hash_service.repository_uri
    }

    environment_variable {
      name  = "AWS_REGION"
      value = "eu-central-1"
    }

    environment_variable {
      name  = "GITHUB_TOKEN"
      value = data.aws_secretsmanager_secret_version.github_token_version.secret_string
    }
  }

  source {
    type = "CODEPIPELINE"
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  service_role = data.aws_iam_role.codebuild_service_role.arn
}

# Reference the existing IAM role for CodePipeline
data "aws_iam_role" "codepipeline_service_role" {
  name = "admin"
}

# Define CodePipeline pipeline
resource "aws_codepipeline" "hash_service_pipeline" {
  name     = "hash-service-pipeline"
  role_arn = data.aws_iam_role.codepipeline_service_role.arn

  artifact_store {
    type     = "S3"
    location = aws_s3_bucket.pipeline_artifacts.bucket
  }

  stage {
    name = "Source"

    action {
      name             = "SourceAction"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      configuration = {
        Owner      = "MisyuraIlya"
        Repo       = "hash-service"
        Branch     = "main"
        OAuthToken = data.aws_secretsmanager_secret_version.github_token_version.secret_string
      }

      output_artifacts = ["source_output"]
    }
  }

  stage {
    name = "Build"

    action {
      name             = "BuildAction"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      configuration = {
        ProjectName = aws_codebuild_project.hash_service_build.name
      }

      output_artifacts = ["build_output"]
    }
  }
}

# Retrieve GitHub token from Secrets Manager
data "aws_secretsmanager_secret_version" "github_token_version" {
  secret_id = "github"  # Ensure this matches your Secrets Manager secret ID
}

# IAM Role to be granted ECR permissions
data "aws_iam_role" "ecrpublic" {
  name = "admin"
}
