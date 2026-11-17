# 📸 Cyberpunk Red Team SQL Injection Lab: Visual UI Walkthrough

This document showcases the interface layout, interactive states, and telemetry views.

---

## 1. Operations Dashboard (HUD)

```text
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║ 🩸 RED TEAM SQLi LAB  [LVL 3 // PAYLOAD TESTER]   [🌧️ RAIN: ON]  [🔊 AUDIO: ON] [RESET] ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                          ║
║   CYBERPUNK RED TEAM // SQLi MATRIX               [ LAUNCH LABS ]  [ PLAYGROUND ]        ║
║   Offensive AppSec & Defensive Simulation Lab                                            ║
║                                                                                          ║
║   PROGRESSION: 3 / 7 CHALLENGES COMPLETED (42.8%)                                        ║
║   [██████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]               ║
║                                                                                          ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  [LESSONS: 13]    [FLAGS CAPTURED: 3/7]    [LAB TARGETS: 7 ONLINE]   [WAF: MEDIUM]       ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                        ║  TESTING AUDIT STREAM           ║
║  01 Lab 1: Login Authentication Bypass   [FLAG CAUGHT] ║  [BLOCKED] ' UNION SELECT 1,2,3 ║
║  02 Lab 2: Search Parameter Injection    [FLAG CAUGHT] ║  [ALLOWED] Laptop Bag Pro      ║
║  03 Lab 3: Product SKU Numeric Injection [FLAG CAUGHT] ║  [BLOCKED] admin' OR 1=1 --    ║
║  04 Lab 4: UNION-Based Data Exfiltration [PENDING]     ║  [ALLOWED] Dr. Sean O'Connor    ║
║  05 Lab 5: Boolean-Based Blind SQLi      [PENDING]     ║  [BLOCKED] '; SELECT sleep(2)   ║
║  06 Lab 6: Error-Based Diagnostic Leak   [PENDING]     ║  [ALLOWED] Cyberdeck Mk-IV      ║
║  07 Lab 7: Time-Based Blind Latency Probe[PENDING]     ║                                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Interactive AST Query Visualizer

When executing payloads in the Playground or Labs, the query pipeline breaks down the reconstructed SQL statement and highlights the untrusted input token in glowing red:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚙️ AST QUERY EXECUTION PIPELINE   LATENCY: 1.42ms   ROWS: 5   [⚠️ AST MUTATED (INJECTION)]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ RECONSTRUCTED SQL STATEMENT:                                                             │
│ SELECT id, username, role FROM users WHERE username = ' [ ' OR '1'='1 ] ';               │
│                                                          ▲▲▲▲▲▲▲▲▲▲▲▲▲                   │
│                                                      (Glowing Neon Red)                  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [1] LEXER / SCANNER         ──► [2] GRAMMAR PARSER         ──► [3] ENGINE DISPATCH       │
│ Tokenization into symbols       Abstract Syntax Tree (AST)     Storage row evaluation    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Simulated Layer-7 WAF Cyber Shield

When an attack payload triggers an active signature rule, the WAF emits a digital shield barrier ripple:

```text
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  [🛡️ BLOCKED // HTTP 403]  PROFILE: MEDIUM                     RISK INDEX: 98 / 100     ║
║  SIMULATED CYBER SHIELD: THREAT INTERCEPTED                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║  ⚠️ MATCHED RULE: RULE-101 — UNION SELECT Attack Signature                               ║
║  The input matched signature pattern: (?i)\bUNION\s+(?:ALL\s+)?SELECT\b                  ║
║  FLAGGED TOKEN: [ UNION SELECT ]                                                         ║
║                                                                                          ║
║  INSPECTION PIPELINE TRACE:                                                              ║
║  > Stage 1 [Ingress]: Received payload via query_parameter                               ║
║  > Stage 2 [Normalization]: Decoded raw text -> '' UNION SELECT 1,2,3 --...'             ║
║  > Stage 3 [Policy Check]: Sensitivity 'MEDIUM' applies to ['CRITICAL', 'HIGH']          ║
║  > Stage 4 [Signature Evaluation]: MATCH DETECTED on RULE-101 ('UNION SELECT')           ║
║  > Stage 5 [Verdict]: Action -> BLOCK (HTTP 403 Forbidden)                               ║
║                                                                                          ║
║  🛡️ DEFENSIVE GUIDANCE:                                                                  │
║  Ensure server-side code uses parameterized statements (prepared statements).            │
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. Side-by-Side Secure Coding Diff

Every lab provides instant side-by-side code comparisons so developers learn the exact remediation:

```python
# ❌ VULNERABLE ANTI-PATTERN (String Concatenation):
raw_sql = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}';"
cursor.execute(raw_sql)

# ✅ SECURE PATTERN (Parameterized Prepared Statement):
raw_sql = "SELECT id, username, password_hash FROM users WHERE username = ?;"
cursor.execute(raw_sql, (username,))
user = cursor.fetchone()
if user and bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
    grant_session(user)
```

