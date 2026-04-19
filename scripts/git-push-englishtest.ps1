# Push project to https://github.com/ahmed11551/englishtest
# Requires: Git for Windows. Use PAT for HTTPS auth if prompted.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$RemoteUrl = "https://github.com/ahmed11551/englishtest.git"

function Get-GitExe {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($p in @(
            "$env:ProgramFiles\Git\cmd\git.exe",
            "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
            "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
        )) {
        if (Test-Path $p) { return $p }
    }
    return $null
}

$GitExe = Get-GitExe
if (-not $GitExe) {
    Write-Error "Git not found. Install Git for Windows or add git to PATH."
}

if (-not (Test-Path ".git")) {
    & $GitExe init
}

$null = & $GitExe remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    & $GitExe remote set-url origin $RemoteUrl
} else {
    & $GitExe remote add origin $RemoteUrl
}

& $GitExe add -A
& $GitExe status

$pending = & $GitExe status --porcelain
if ($pending) {
    $name = & $GitExe config user.name 2>$null
    $email = & $GitExe config user.email 2>$null
    if (-not $name -or -not $email) {
        Write-Host "Set identity once (local repo only), then re-run:"
        Write-Host "  git config --local user.name `"Your Name`""
        Write-Host "  git config --local user.email `"you@users.noreply.github.com`""
        Write-Error "Git needs user.name and user.email for commit."
    }
    & $GitExe commit -m "Initial commit: Telegram grammar bot, Mini App, Vercel web"
} else {
    Write-Host "Nothing to commit. Trying push..."
}

& $GitExe branch -M main 2>$null

Write-Host ""
Write-Host "Pushing to origin main..."
Write-Host ""
& $GitExe push -u origin main

Write-Host ""
Write-Host "Done. Remote: $RemoteUrl"
