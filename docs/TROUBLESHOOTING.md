# 🛠️ SQL Injection Learning Lab: Troubleshooting Guide

This guide addresses common setup issues, network edge-cases, and debugging workflows.

---

## 1. Port 8000 Already in Use

### Symptom:
`ERROR: [Errno 98] Address already in use` or `[WinError 10048] Only one usage of each socket address is normally permitted`.

### Solution:
Another process (such as a previous uvicorn instance or background server) is occupying port 8000.

**On Windows:**
```powershell
# Identify process using port 8000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Terminate the process:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

**On Linux / Kali:**
```bash
# Find and kill process on port 8000:
sudo lsof -i :8000
sudo fuser -k 8000/tcp
```

Alternatively, change the port in `backend/app/core/config.py` or specify `--port 8080` when running uvicorn.

---

## 2. Frontend Assets Not Found (White Page or 404 on Root)

### Symptom:
Accessing `http://127.0.0.1:8000` returns a JSON API message or 404 instead of the cyberpunk UI.

### Cause:
The frontend static assets in `frontend/dist` have not been pre-compiled.

### Solution:
Compile the frontend assets with Vite:

```bash
cd frontend
npm install
npm run build
```

This creates the optimized production build at `frontend/dist`. The FastAPI backend automatically detects this directory and serves the single-page application.

---

## 3. Database Corrupted or Test Records Mutated

### Symptom:
You performed a DROP or test update that wiped records, or test queries return unexpected states.

### Solution:
Click the **"RESET LAB"** button in the top navigation bar, or execute:

**Via curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/system/reset-database
```

**Via Python:**
```python
from app.core.database import reset_database
reset_database()
```

This instantly wipes `data/sql_lab.db` and re-seeds all fictional users, credentials, products, employees, orders, and challenges in under 50ms.

---

## 4. WAF Blocks Normal Words (False Positives)

### Symptom:
You type `Dr. Sean O'Connor` or `Search for union` and receive `HTTP 403 Forbidden: Red Team Cyber Shield Activated`.

### Cause:
The WAF sensitivity is set to `PARANOID`, or Rule 107 (Strict Single Quote) is enabled.

### Solution:
1. Navigate to the **"WAF LAB"** tab.
2. Under "Firewall Sensitivity Profile", switch from `PARANOID` to `MEDIUM` or `LOW`.
3. In the "Active Signature Rules" panel on the right, toggle off `RULE-107` (Strict Single Quote Detection).
4. Re-run your query.

---

## 5. Web Audio Synthesizer is Silent

### Symptom:
No clicks or exploit chimes play when interacting with the UI.

### Cause:
Browsers (Chrome, Edge, Firefox) require user interaction before activating the Web Audio context, and sound FX are muted by default to avoid unexpected noise.

### Solution:
Click the **Speaker Icon** (🔊) in the top-right navigation bar to toggle Audio FX ON. Click anywhere on the screen to enable browser audio privileges.

---

## 6. Running Behind Docker on Non-Standard Host

### Symptom:
Docker container starts but `http://localhost:8000` is unreachable.

### Solution:
Check container status:
```bash
docker compose ps
docker compose logs sqli-lab
```

Ensure the container port binding maps to `127.0.0.1:8000:8000`:
```bash
curl http://127.0.0.1:8000/api/health
```

If testing from a remote VM host, change `127.0.0.1:8000:8000` in `docker-compose.yml` to `0.0.0.0:8000:8000` (ensure this is on an isolated private lab network!).

