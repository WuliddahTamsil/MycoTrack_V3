Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting MycoTrack Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location $PSScriptRoot
Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
node server.js

