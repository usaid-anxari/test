#!/bin/bash
# Load environment variables from .env.production
set -a
source <(grep -v '^#' .env.production | grep -v '^$')
set +a
echo "✅ Environment variables loaded from .env.production"
