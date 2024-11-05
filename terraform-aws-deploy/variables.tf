# variables.tf

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "List of Availability Zones"
  type        = list(string)
  # Remove the default that uses the data source
  # default     = [for az in data.aws_availability_zones.available.names : az]
}