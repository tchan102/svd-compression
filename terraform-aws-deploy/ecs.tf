# ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "my-ecs-cluster"
}