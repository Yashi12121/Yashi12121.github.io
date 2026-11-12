# YashiX Windows Installer
$ErrorActionPreference = 'Stop'
Write-Host "Installing YashiX Swarm Rebuild (v0.1.9)..." -ForegroundColor Cyan

$releaseUrl = "https://github.com/Yashi12121/YashiX/releases/download/v0.1.9/YashiX-Setup-0.1.9.exe"
$tempPath = Join-Path $env:TEMP "YashiX-Setup-0.1.9.exe"

Write-Host "Downloading installer from $releaseUrl..." -ForegroundColor Gray
Invoke-WebRequest -Uri $releaseUrl -OutFile $tempPath -UseBasicParsing

Write-Host "Launching YashiX Setup..." -ForegroundColor Green
Start-Process -FilePath $tempPath

Write-Host "YashiX installation launched successfully." -ForegroundColor Green
