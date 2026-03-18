#!/bin/bash

set -e

echo "Starting backend deployment..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "${SCRIPT_DIR}/.." && pwd )"
INFRASTRUCTURE_DIR="$( cd "${BACKEND_DIR}/../infrastructure" && pwd )"

cd "${BACKEND_DIR}"

echo "Installing backend dependencies..."
npm install

echo "Building backend runtime artifacts..."
npm run build

chmod +x ./scripts/prepare-lambda-packages.sh
echo "Preparing backend Lambda runtime assets..."
./scripts/prepare-lambda-packages.sh

cd "${INFRASTRUCTURE_DIR}"

echo "Installing infrastructure dependencies..."
npm install

echo "Building infrastructure..."
npm run build

echo "Deploying CDK stack..."
cdk deploy --require-approval never

echo "Backend deployment completed successfully!"
