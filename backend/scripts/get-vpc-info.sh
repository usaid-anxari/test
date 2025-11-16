#!/bin/bash

echo "🔍 Finding VPC and Subnet Information..."
echo "=========================================="

# Get RDS VPC
RDS_ENDPOINT="database-1.cc9008m045dg.us-east-1.rds.amazonaws.com"
echo -e "\n📍 Looking up RDS instance..."

# Get RDS details
RDS_INFO=$(aws rds describe-db-instances \
  --region us-east-1 \
  --query "DBInstances[?Endpoint.Address=='$RDS_ENDPOINT'].[DBSubnetGroup.VpcId,DBSubnetGroup.Subnets[*].SubnetIdentifier]" \
  --output text 2>/dev/null)

if [ -z "$RDS_INFO" ]; then
  echo "⚠️  RDS not found. Listing all VPCs and subnets..."
  
  # List all VPCs
  echo -e "\n📋 Available VPCs:"
  aws ec2 describe-vpcs --region us-east-1 --query "Vpcs[].[VpcId,Tags[?Key=='Name'].Value|[0]]" --output table
  
  # List all subnets
  echo -e "\n📋 Available Subnets (use 2 PRIVATE subnets in same VPC):"
  aws ec2 describe-subnets --region us-east-1 \
    --query "Subnets[].[SubnetId,VpcId,AvailabilityZone,CidrBlock,Tags[?Key=='Name'].Value|[0]]" \
    --output table
else
  VPC_ID=$(echo "$RDS_INFO" | awk '{print $1}')
  echo "✅ Found RDS VPC: $VPC_ID"
  
  # Get private subnets in same VPC
  echo -e "\n📋 Private Subnets in VPC $VPC_ID:"
  aws ec2 describe-subnets --region us-east-1 \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[].[SubnetId,AvailabilityZone,CidrBlock,Tags[?Key=='Name'].Value|[0]]" \
    --output table
  
  # Get first 2 subnet IDs
  SUBNETS=$(aws ec2 describe-subnets --region us-east-1 \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[0:2].SubnetId" \
    --output text)
  
  SUBNET_1=$(echo $SUBNETS | awk '{print $1}')
  SUBNET_2=$(echo $SUBNETS | awk '{print $2}')
  
  echo -e "\n✅ Recommended Subnets:"
  echo "SUBNET_ID_1=$SUBNET_1"
  echo "SUBNET_ID_2=$SUBNET_2"
  
  # Get security group
  echo -e "\n📋 Security Groups in VPC:"
  aws ec2 describe-security-groups --region us-east-1 \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "SecurityGroups[].[GroupId,GroupName,Description]" \
    --output table
fi

echo -e "\n💡 Copy the subnet IDs to your .env.production file"
