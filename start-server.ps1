# Start OBE System Server
Write-Host "Starting OBE System Server..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\server"
& node index.js
