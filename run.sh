#!/usr/bin/env bash
# ==============================================================================
# Cyberpunk Red Team: SQL Injection Testing & Learning Lab
# Localhost Startup Script for Kali Linux, Ubuntu, Debian & macOS
# ==============================================================================

set -e

# Change directory to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================================"
echo "    ██████╗ ███████╗██████╗     ████████╗███████╗ █████╗ ███╗   ███╗  "
echo "    ██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║  "
echo "    ██████╔╝█████╗  ██║  ██║       ██║   █████╗  ███████║██╔████╔██║  "
echo "    ██╔══██╗██╔══╝  ██║  ██║       ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║  "
echo "    ██║  ██║███████╗██████╔╝       ██║   ███████╗██║  ██║██║ ╚═╝ ██║  "
echo "    ╚═╝  ╚═╝╚══════╝╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  "
echo "       SQL INJECTION TESTING & DEFENSIVE LEARNING LABORATORY         "
echo "======================================================================"
echo "[*] Initializing Cyberpunk Red Team SQLi Lab on localhost..."

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[-] Error: python3 is not installed or not in PATH."
    echo "[!] Run: sudo apt update && sudo apt install -y python3 python3-pip python3-venv"
    exit 1
fi

# Create and activate virtual environment if not present
if [ ! -d "venv" ]; then
    echo "[*] Creating Python virtual environment at ./venv..."
    python3 -m venv venv
fi

echo "[*] Activating virtual environment..."
source venv/bin/activate

# Install / update backend dependencies
echo "[*] Verifying backend dependencies..."
pip install -q -r backend/requirements.txt

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "[*] Pre-building frontend production assets..."
    if command -v npm &> /dev/null; then
        (cd frontend && npm install && npm run build)
    else
        echo "[!] Warning: npm not found. Make sure frontend/dist is built or install Node.js."
    fi
fi

echo "[+] Lab Database: backend/data/sql_lab.db (SQLite Isolated)"
echo "[+] Target Scope: Localhost only (127.0.0.1:8000)"
echo "[+] Starting Red Team Fullstack Application Server..."
echo "----------------------------------------------------------------------"
echo ">>> OPEN IN YOUR BROWSER: http://127.0.0.1:8000 <<<"
echo "----------------------------------------------------------------------"
echo "Press CTRL+C at any time to shut down the lab server."

cd backend
python run_backend.py

