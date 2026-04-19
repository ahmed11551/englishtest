# Push project to https://github.com/ahmed11551/englishtest
# Requires: Git for Windows. Use PAT for HTTPS auth.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$RemoteUrl = "https://github.com/ahmed11551/englishtest.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git not found in PATH. Install Git for Windows and restart the terminal."
}

if (-not (Test-Path ".git")) {
    git init
}

$null = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $RemoteUrl
} else {
    git remote add origin $RemoteUrl
}

git add -A
git status

$pending = git status --porcelain
if ($pending) {
    git commit -m "Initial commit: Telegram grammar bot, Mini App, Vercel web"
} else {
    Write-Host "Nothing to commit. Trying push..."
}

git branch -M main 2>$null

Write-Host ""
Write-Host "Pushing to origin main..."
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "Done. Remote: $RemoteUrl"
