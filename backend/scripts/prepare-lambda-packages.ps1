# PowerShell script to prepare backend Lambda runtime assets in ./dist

$ErrorActionPreference = "Stop"

Write-Host "Preparing backend Lambda runtime assets..."

$DistDir = "./dist"
$DistPackageJson = Join-Path $DistDir "package.json"
$BackendPackageJson = "./package.json"

if (-not (Test-Path $DistDir)) {
    throw "dist directory does not exist. Run npm run build in /backend first."
}

if (Test-Path (Join-Path $DistDir "node_modules")) {
    cmd /c "rmdir /s /q ""$DistDir\node_modules"""
}

if (Test-Path $DistPackageJson) {
    Remove-Item $DistPackageJson -Force
}

Copy-Item $BackendPackageJson -Destination $DistPackageJson -Force

Push-Location $DistDir
npm install --omit=dev
Pop-Location

Write-Host "Backend Lambda runtime assets prepared successfully in $DistDir"
