# Start OBE System Client
Write-Host "Starting OBE System Client..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\client"
& npm start
