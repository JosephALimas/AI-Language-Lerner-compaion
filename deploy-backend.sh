#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="${SCRIPT_DIR}/backend"
INFRASTRUCTURE_DIR="${SCRIPT_DIR}/infrastructure"

STACK_NAME="${STACK_NAME:-AppStack}"

echo "Starting backend deployment..."
echo "Stack name: ${STACK_NAME}"

cd "${BACKEND_DIR}"

echo "Installing backend dependencies..."
npm install

echo "Building backend runtime artifacts..."
npm run build

chmod +x ./scripts/prepare-lambda-packages.sh
echo "Preparing Lambda deployment packages..."
./scripts/prepare-lambda-packages.sh

cd "${INFRASTRUCTURE_DIR}"

echo "Installing infrastructure dependencies..."
npm install

echo "Ensuring @types/node is installed..."
npm install --save-dev @types/node

echo "Building infrastructure code..."
npm run build

echo "Ensuring CDK environment is bootstrapped..."
cdk bootstrap

echo "Deploying backend infrastructure..."
cdk deploy "${STACK_NAME}" --require-approval never

echo "Backend deployment completed successfully!"
