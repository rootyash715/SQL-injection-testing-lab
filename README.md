# 🩸 Cyberpunk Red Team: SQL Injection Testing & Learning Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61DAFB.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Security: Educational Localhost](https://img.shields.io/badge/Environment-127.0.0.1%20Isolated-emerald.svg)](#security-boundaries)

---

## ⚡ Overview

**Cyberpunk Red Team: SQL Injection Lab** is a full-stack, interactive educational application security training platform and defensive simulator. Built for security students, application developers, penetration testers, and DevSecOps engineers, it bridges the gap between offensive exploitation theory and production-grade software defense.

Featuring a red-team cyberpunk aesthetic, an animated multi-monitor anime hacker backdrop, real-time Abstract Syntax Tree (AST) query visualizations, a Layer-7 Web Application Firewall (WAF) simulator, and 7 intentionally vulnerable application scenarios running on an isolated local SQLite database.

```text
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║                                                                            ║
 ║    ██████╗ ███████╗██████╗     ████████╗███████╗ █████╗ ███╗   ███╗        ║
 ║    ██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║        ║
 ║    ██████╔╝█████╗  ██║  ██║       ██║   █████╗  ███████║██╔████╔██║        ║
 ║    ██╔══██╗██╔══╝  ██║  ██║       ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║        ║
 ║    ██║  ██║███████╗██████╔╝       ██║   ███████╗██║  ██║██║ ╚═╝ ██║        ║
 ║    ╚═╝  ╚═╝╚══════╝╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝        ║
 ║                                                                            ║
 ║          OFFENSIVE APPSEC & DEFENSIVE QUERY SIMULATION LABORATORY          ║
 ║                                                                            ║
 ╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 🌟 Core System Features

### 1. 🎨 Cyberpunk Red Team Visual Experience
- **Color Palette**: Dark charcoal & graphite (`#07080B`), blood-red & neon crimson accents (`#EF4444`, `#FF2A51`), silver secondary elements.
- **Original Anime Hacker Artwork**: Custom high-detail SVG multi-monitor workstation illustration with neon glowing terminals, holographic city horizon, techwear silhouette, and audio-reactive HUD telemetry.
- **Canvas Matrix Rain**: Subtle falling Japanese Katakana and SQL characters stream in red and silver.
- **Synthesized Audio Engine**: Zero-dependency Web Audio API synthesizer generating futuristic clicks, exploit success chimes, WAF alarms, and flag capture sounds (with mute toggle).
- **Glassmorphism HUD**: Glass panels with subtle crimson border glows, glowing red terminal scanlines, and blinking red cursor.

### 2. 📊 Operations Dashboard
- **Telemetry Counter**: Tracks all 13 curriculum lessons and 7 interactive challenges.
- **Progression Rank**: Automatic rank upgrades from `LVL 1 // RECON OPERATOR` to `LVL 8 // CYBER GHOST MASTER`.
- **Target Instance Health**: Real-time status indicators for all 7 local lab targets.
- **WAF Telemetry**: Sensitivity levels, active rule count, blocked requests metric.
- **Testing Audit Stream**: Live log showing recently inspected payloads, matched signatures, and verdict status.

### 3. 📚 13-Module Learning Curriculum
In-depth offensive theory, syntax tree mechanics, code comparisons, and interactive executable sandboxes:
1. **SQL Injection Fundamentals**: Boundary violation between SQL code and user input.
2. **How SQL Queries Work**: Lexical tokenization, grammar parsing, query optimization, execution.
3. **Authentication-Based SQLi**: Bypassing login checks (`' OR 1=1 --`).
4. **Error-Based SQLi**: Forcing database exceptions that disclose sensitive data.
5. **UNION-Based SQLi**: Column count matching and cross-table exfiltration.
6. **Boolean-Based Blind SQLi**: Inferring data bit-by-bit via subtle TRUE/FALSE response differences.
7. **Time-Based Blind SQLi**: Clocking server response latency with injected delay queries.
8. **Second-Order SQLi**: Stored payload detonation in downstream database routines.
9. **Database Fingerprinting**: Dialect analysis (SQLite vs MySQL vs PostgreSQL vs MSSQL).
10. **SQLi Prevention Architecture**: Defense-in-depth, least privilege, ORMs, and secure coding.
11. **Prepared Statements**: Why parameterization is mathematically immune to syntax tree injection.
12. **Input Validation**: Allowlisting dynamic identifiers (column/table names) vs blacklist pitfalls.
13. **WAF Fundamentals**: Signature inspection, tokenization, AST analysis, limitations & false positives.

### 4. 🧪 Interactive Payload Playground
- **Payload Editor**: Cyberpunk monospace editor with preset dropdown of educational payloads.
- **Database Dialect Selector**: SQLite active engine, with syntax guides for MySQL, PostgreSQL, and MSSQL.
- **Parameter & Query Selector**: Switch between username strings, numeric SKU IDs, LIKE searches, and UNION targets.
- **AST Query Visualizer**: Color-coded token decomposition highlighting the injected payload in glowing red.
- **Request / Response Inspector**: Inspect HTTP headers, response latency in ms, database error traces, and returned rows.
- **Deep Explanatory Breakdown**: For every payload: What it does, Why it works, What response to expect, and How to fix it.

### 5. 🛡️ Layer-7 Simulated WAF Lab
- **Regex & Heuristic Inspection Pipeline**: Ingress -> Normalization & URL decoding -> Policy Check -> Signature Evaluation -> Verdict.
- **Configurable Sensitivity Profiles**: `LOW`, `MEDIUM`, `HIGH`, `PARANOID`.
- **Signature Rules Engine**:
  - `RULE-101`: UNION SELECT attack signature.
  - `RULE-102`: Boolean tautology (`' OR 1=1`).
  - `RULE-103`: Comment syntax truncation (`--`, `/*`, `#`).
  - `RULE-104`: Time delay & benchmark execution (`sleep`, `pg_sleep`).
  - `RULE-105`: Database metadata reconnaissance (`sqlite_master`, `information_schema`).
  - `RULE-106`: Stacked queries & command injection.
  - `RULE-107`: Strict single quote filter (demonstrates false positives).
  - `RULE-108`: Hexadecimal / byte encoding filter.
- **False-Positive Demonstration**: Test innocent inputs (e.g. `Dr. Sean O'Connor`, `Search for local union representative`) to observe how overly strict WAF rules disrupt legitimate business traffic.
- **Digital Cyber Shield Animation**: Pulsing red laser sweep barrier triggered on blocked requests.

### 6. 🎯 7 Vulnerable Application Labs
1. **Lab 1: Login Authentication Bypass** (`/api/labs/login`)
   - Scenario: RedCorp Executive Gateway authentication bypass.
   - Objective: Log in as `admin` without knowing the secret password.
   - Flag: `FLAG{RED_TEAM_AUTH_BYPASS_99}`
2. **Lab 2: Search Parameter Injection** (`/api/labs/search`)
   - Scenario: Product Catalog search inside a `LIKE '%query%'` clause.
   - Objective: Bypass the `is_public = 1` constraint to dump unlisted classified military cyber tools.
   - Flag: `FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}`
3. **Lab 3: Product SKU Numeric Injection** (`/api/labs/product`)
   - Scenario: Unquoted numeric parameter query (`WHERE id = {id}`).
   - Objective: Prove that injection does not require single quotes by injecting `1 OR 1=1`.
   - Flag: `FLAG{NUMERIC_ID_TAUTOLOGY_31}`
4. **Lab 4: UNION-Based Data Exfiltration** (`/api/labs/employees`)
   - Scenario: Public employee directory query returning 3 columns.
   - Objective: Determine column count and extract rows from the restricted `secret_credentials` table.
   - Flag: `FLAG{UNION_DATA_EXFILTRATED_77}`
5. **Lab 5: Boolean-Based Blind SQLi** (`/api/labs/user-check`)
   - Scenario: User verification endpoint with no direct data output.
   - Objective: Infer the administrator's secret 4-digit PIN (`7492`) via Boolean TRUE/FALSE responses.
   - Flag: `FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}`
6. **Lab 6: Error-Based Diagnostic Leak** (`/api/labs/order-status`)
   - Scenario: Order status lookup with verbose debug error reporting enabled.
   - Objective: Force an informative database exception to leak diagnostic telemetry and internal flags.
   - Flag: `FLAG{ERROR_BASED_VERSION_LEAKED_55}`
7. **Lab 7: Time-Based Blind Latency Probe** (`/api/labs/feedback`)
   - Scenario: Security feedback submission logging into an internal database.
   - Objective: Measure clock latency using injected delay functions (`sleep(2)`) to verify code execution.
   - Flag: `FLAG{TIME_BASED_LATENCY_CRACKED_88}`

---

## 🚀 Quick Start & Installation

### Option 1: Native Windows Quick Launch (Recommended for Windows)

From PowerShell or Command Prompt inside the `sql-injection-lab` directory:

```powershell
# Using the PowerShell launcher:
.\run.ps1

# Or using the Command Prompt batch script:
run.bat
```

The script verifies Python, launches the backend (which serves the pre-built frontend SPA), and opens `http://127.0.0.1:8000` in your default browser.

---

### Option 2: Kali Linux / Ubuntu / Debian / macOS

```bash
# 1. Ensure Python 3.11+ and venv are installed:
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git

# 2. Make the run script executable and start the lab:
chmod +x run.sh
./run.sh
```

Open your browser to: **`http://127.0.0.1:8000`**

---

### Option 3: Docker & Docker Compose

To run the fully containerized multi-stage build:

```bash
# Build and run container in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

The application will be accessible at: **`http://127.0.0.1:8000`**

---

### Option 4: Full-Stack Development Mode (Hot-Reloading)

If you want to edit both backend and frontend code with live hot-reloading:

**Terminal 1 (Backend):**
```bash
cd backend
python run_backend.py
# Backend API runs at http://127.0.0.1:8000 (Swagger docs at /docs)
```

**Terminal 2 (Frontend with Vite):**
```bash
cd frontend
npm run dev
# Frontend dev server runs at http://127.0.0.1:5173 (proxies /api to port 8000)
```

---

## 🔒 Security Boundaries & Responsible Use

> [!IMPORTANT]
> **Ethical & Defensive Intent**: This software is engineered exclusively for authorized educational training, defense research, and secure software development education.

- **Localhost Isolation**: All lab endpoints are strictly restricted to `127.0.0.1` and local Docker containers.
- **Fictional Data**: All database records (users, API keys, badge numbers, products) are entirely fictional.
- **Zero Outbound Scanning**: The application never initiates external network requests or scans against third-party hosts.
- **One-Click Factory Reset**: A dedicated "RESET LAB" button drops and re-seeds the local SQLite database at any time.

---

## 🧪 Automated Test Suite

The laboratory includes an automated test suite verifying all 7 labs, the WAF inspection pipeline, the playground, and curriculum data.

To run the automated tests:

```bash
cd backend
python -m pytest tests/test_backend.py -v
```

Expected output:
```text
tests\test_backend.py::test_curriculum_modules PASSED       [  9%]
tests\test_backend.py::test_labs_metadata_catalog PASSED    [ 18%]
tests\test_backend.py::test_lab1_login_auth PASSED          [ 27%]
tests\test_backend.py::test_lab2_search PASSED              [ 36%]
tests\test_backend.py::test_lab3_numeric PASSED             [ 45%]
tests\test_backend.py::test_lab4_union PASSED               [ 54%]
tests\test_backend.py::test_lab5_boolean_blind PASSED       [ 63%]
tests\test_backend.py::test_lab6_error_based PASSED         [ 72%]
tests\test_backend.py::test_lab7_time_based PASSED          [ 81%]
tests\test_backend.py::test_waf_inspection PASSED           [ 90%]
tests\test_backend.py::test_playground_execution PASSED     [100%]

======================= 11 passed in 3.87s =======================
```

---

## 📁 Project Directory Structure

```text
sql-injection-lab/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py             # Dashboard, flag verification, WAF controls
│   │   ├── core/
│   │   │   ├── config.py             # Environment settings & path configuration
│   │   │   └── database.py           # SQLite engine, custom sleep(), and seed generator
│   │   ├── labs/
│   │   │   └── lab_routes.py         # 7 Intentionally vulnerable lab endpoints
│   │   ├── models/
│   │   │   └── models.py             # SQLAlchemy schemas (users, products, secrets, orders)
│   │   ├── modules/
│   │   │   └── curriculum.py         # 13 structured lessons with AST diagrams & demos
│   │   ├── playground/
│   │   │   └── executor.py           # Sandbox query runner & educational breakdown
│   │   ├── waf/
│   │   │   └── engine.py             # Simulated Layer-7 WAF regex & AST inspection engine
│   │   └── main.py                   # FastAPI app, CORS, lifespan, SPA static serving
│   ├── data/
│   │   └── sql_lab.db                # Auto-generated isolated local SQLite database
│   ├── tests/
│   │   └── test_backend.py           # 11 automated unit tests
│   ├── requirements.txt              # Backend dependencies
│   └── run_backend.py                # Standalone backend runner
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioController.ts    # Web Audio API synthesizer for cyber sound effects
│   │   │   ├── CyberBackground.tsx   # Anime hacker multi-monitor SVG & Canvas matrix rain
│   │   │   ├── Navbar.tsx            # Red Team HUD, rank badge, audio/rain toggles, DB reset
│   │   │   ├── QueryVisualizer.tsx   # AST query execution visualizer with red highlights
│   │   │   ├── TerminalWindow.tsx    # Styled cyberpunk terminal with glowing cursor
│   │   │   └── WafShieldAnimation.tsx# Neon cyber defense shield ripple animation
│   │   ├── views/
│   │   │   ├── DashboardView.tsx     # Overview stats, progress bar, lab trackers, audit logs
│   │   │   ├── ModulesView.tsx       # 13 Interactive curriculum lessons with live sandbox
│   │   │   ├── PlaygroundView.tsx    # Testing workbench, dialect notes, request/response
│   │   │   ├── WafLabView.tsx        # Simulated WAF lab, rule toggles, false-positive tester
│   │   │   └── VulnerableLabsView.tsx# 7 Vulnerable labs with side-by-side secure code diffs
│   │   ├── api.ts                    # Typed API client
│   │   ├── types.ts                  # TypeScript interfaces
│   │   ├── index.css                 # Cyberpunk styling, scanlines, scrollbars, glowing borders
│   │   ├── App.tsx                   # Main SPA container
│   │   └── main.tsx                  # React entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docs/
│   ├── KALI_LINUX_GUIDE.md           # Step-by-step Kali Linux installation & penetration testing guide
│   └── TROUBLESHOOTING.md            # Comprehensive troubleshooting guide
├── Dockerfile                        # Multi-stage production container build
├── docker-compose.yml                # Docker compose orchestration
├── run.bat                           # Windows batch launcher
├── run.ps1                           # Windows PowerShell launcher
├── run.sh                            # Linux / Kali / macOS launcher
└── README.md                         # Documentation
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

