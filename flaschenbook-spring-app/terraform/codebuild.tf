locals {
  ecr_base_url = trimsuffix(aws_ecr_repository.flaschenbook-frontend.repository_url, "/flaschenbook-frontend")
}

resource "aws_codebuild_project" "flb-frontend-codebuild" {
  name          = "flb-frontend-codebuild"
  build_timeout = "5"
  service_role  = aws_iam_role.flb-codebuild_role.arn
  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:5.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = true
    environment_variable {
      name  = "REPOSITORY_NAME"
      value = aws_ecr_repository.flaschenbook-frontend.name
    }
    environment_variable {
      name  = "ECR_BASE_URL"
      value = local.ecr_base_url
    }
    environment_variable {
      name  = "REPOSITORY_URI"
      value = aws_ecr_repository.flaschenbook-frontend.repository_url
    }
    environment_variable {
      name  = "CONTAINER_NAME"
      value = "flb-frontend"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = <<-EOT
      version: 0.2
      phases:
        pre_build:
          commands:
            - echo "Logging in to Amazon ECR..."
            - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_BASE_URL
        build:
          commands:
            - echo "Building the Docker image..."
            - docker build -t $REPOSITORY_NAME .
            - docker tag $REPOSITORY_NAME:latest $REPOSITORY_URI:latest
        post_build:
          commands:
            - echo "Pushing the Docker image..."
            - docker push $REPOSITORY_URI:latest
            - echo '[{"name":"$CONTAINER_NAME","imageUri":"'$REPOSITORY_URI:latest'"}]' > imagedefinitions.json
            - mv imagedefinitions.json /codebuild/output/
    EOT
  }
}