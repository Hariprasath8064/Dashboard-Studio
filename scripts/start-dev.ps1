# .\scripts\start-dev.ps1

$root = Split-Path $PSScriptRoot -Parent

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; go run ." -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Started backend  -> http://localhost:8081"
Write-Host "Started frontend -> http://localhost:5173"
