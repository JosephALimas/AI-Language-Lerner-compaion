# PowerShell script for backend deployment
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$InfrastructureDir = Join-Path $ScriptDir "infrastructure"

$StackName = if ($env:STACK_NAME) { $env:STACK_NAME } else { "AppStack" }

Write-Host "Starting backend deployment..." -ForegroundColor Cyan
Write-Host "Stack name: $StackName" -ForegroundColor Cyan

Set-Location $BackendDir

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building backend runtime artifacts..." -ForegroundColor Yellow
npm run build

Write-Host "Preparing Lambda deployment packages..." -ForegroundColor Yellow
& "$BackendDir\scripts\prepare-lambda-packages.ps1"

Set-Location $InfrastructureDir

Write-Host "Installing infrastructure dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Ensuring @types/node is installed..." -ForegroundColor Yellow
npm install --save-dev @types/node

Write-Host "Building infrastructure code..." -ForegroundColor Yellow
npm run build

Write-Host "Ensuring CDK environment is bootstrapped..." -ForegroundColor Yellow
cdk bootstrap

Write-Host "Deploying backend infrastructure..." -ForegroundColor Yellow
cdk deploy $StackName --require-approval never

Write-Host "Backend deployment completed successfully!" -ForegroundColor Green
