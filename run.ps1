<#
.SYNOPSIS
Cyberpunk Red Team: SQL Injection Testing & Learning Lab Windows PowerShell Launcher
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Red
Write-Host "   CYBERPUNK RED TEAM: SQL INJECTION TESTING & LEARNING LAB" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Red
Write-Host "[*] Checking Python runtime..." -ForegroundColor Yellow

$pythonCmd = "python"
try {
    $null = & python --version 2>&1
} catch {
    try {
        $null = & py --version 2>&1
        $pythonCmd = "py"
    } catch {
        Write-Host "[-] Python is not installed or not in PATH." -ForegroundColor Red
        exit 1
    }
}

$pyVersion = & $pythonCmd --version
Write-Host "[+] Using: $pyVersion ($pythonCmd)" -ForegroundColor Green

Write-Host "[+] Initializing fullstack application on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "[+] Scope: Localhost only (isolated SQLite database)" -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Red
Write-Host " >>> OPEN IN BROWSER: http://127.0.0.1:8000 <<<" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Red
Write-Host "Press Ctrl+C to terminate the lab server at any time." -ForegroundColor DarkGray
Write-Host ""

Start-Process "http://127.0.0.1:8000"

Set-Location "$ScriptDir\backend"
& $pythonCmd run_backend.py
