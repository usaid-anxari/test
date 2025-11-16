#!/bin/bash

# Pre-Deployment Checklist for AWS Lambda
echo "🔍 TrueTestify Backend - Pre-Deployment Checklist"
echo "=================================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check Environment Variables
echo -e "\n📋 Checking Environment Variables..."
REQUIRED_VARS=("DB_HOST" "DB_USERNAME" "DB_PASSWORD" "DB_NAME" "AUTH0_DOMAIN" "AUTH0_AUDIENCE" "AWS_S3_BUCKET" "STRIPE_SECRET_KEY" "LAMBDA_SECURITY_GROUP_ID" "SUBNET_ID_1" "SUBNET_ID_2")

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}✗${NC} Missing: $var"
    ((ERRORS++))
  else
    echo -e "${GREEN}✓${NC} Found: $var"
  fi
done

# Check Git Security
echo -e "\n🔒 Checking Git Security..."
if git ls-files --error-unmatch .env 2>/dev/null; then
  echo -e "${RED}✗${NC} .env file is tracked by git!"
  ((ERRORS++))
else
  echo -e "${GREEN}✓${NC} .env file is not tracked"
fi

# Check Dependencies
echo -e "\n📦 Checking Dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules exists"
else
  echo -e "${RED}✗${NC} Run: npm install"
  ((ERRORS++))
fi

# Summary
echo -e "\n=================================================="
echo -e "Errors: ${RED}$ERRORS${NC} | Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "\n${GREEN}✅ Ready for deployment!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Fix errors before deploying!${NC}"
  exit 1
fi
