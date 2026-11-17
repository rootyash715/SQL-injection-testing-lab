@echo off
REM ==============================================================================
REM Cyberpunk Red Team: SQL Injection Testing & Learning Lab
REM One-Click Windows Launcher
REM ==============================================================================
title RED TEAM // SQL INJECTION LAB

cd /d "%~dp0"

echo ======================================================================
echo    CYBERPUNK RED TEAM: SQL INJECTION TESTING & LEARNING LAB
echo ======================================================================
echo [*] Checking Python installation...

set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=py
    ) else (
        echo [-] Python is not installed or not in system PATH.
        echo [!] Please install Python 3.11+ from https://www.python.org/
        pause
        exit /b 1
    )
)

echo [*] Using: %PYTHON_CMD%
echo [*] Starting Red Team Lab server on http://127.0.0.1:8000 ...
echo [!] Single-port fullstack architecture: Frontend & API served together.
echo.
echo ======================================================================
echo  URL: http://127.0.0.1:8000
echo ======================================================================
echo.

start http://127.0.0.1:8000

cd backend
%PYTHON_CMD% run_backend.py

pause
