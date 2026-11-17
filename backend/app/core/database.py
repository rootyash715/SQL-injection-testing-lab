"""
Database initialization, session management, and seed data.
Simulated local SQLite environment with full reset capabilities.
"""

import sqlite3
import time
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.models.models import (
    Base,
    User,
    SecretCredential,
    Product,
    Employee,
    Order,
    Feedback,
    ChallengeProgress,
    WafRuleRecord,
)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency that provides a clean SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _sqlite_sleep(seconds: float) -> int:
    """Custom SQLite function to simulate SLEEP() for time-based SQLi exercises."""
    # Clamp delay to maximum 5 seconds for safety and responsiveness
    clamped = max(0.0, min(float(seconds), 5.0))
    time.sleep(clamped)
    return 1


def get_raw_connection() -> sqlite3.Connection:
    """
    Returns a native sqlite3 connection with dict-like row factory and custom functions.
    Used for intentional vulnerable queries in educational labs.
    """
    conn = sqlite3.connect(
        settings.DB_FILE.as_posix(),
        timeout=10.0,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    # Register sleep function so time-based injection works naturally
    conn.create_function("sleep", 1, _sqlite_sleep)
    return conn


def init_db(force: bool = False):
    """Initializes tables and seeds fictional training data."""
    if force and settings.DB_FILE.exists():
        try:
            settings.DB_FILE.unlink()
        except Exception:
            pass

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        # Check if already seeded
        if db.query(User).count() > 0 and not force:
            return

        # Clear existing data if resetting
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()

        # 1. Seed Users
        users = [
            User(
                username="admin",
                password_hash="sha256$8f92a10b48c$c1a84f3928174e92a83e01",  # Uncrackable fictional hash
                role="superadmin",
                email="admin@redcorp.cyber",
                pin="7492",  # Target PIN for Boolean Blind Lab
                is_active=True,
                notes="Red Team Core Administrator. High value target.",
            ),
            User(
                username="ciso_kira",
                password_hash="sha256$93b3104c81a$5e2f7b8891024bc019a89d",
                role="executive",
                email="kira.redteam@redcorp.cyber",
                pin="8819",
                is_active=True,
                notes="Chief Information Security Officer.",
            ),
            User(
                username="ghost_operator",
                password_hash="sha256$22fa901bc09$9a8b7c6d5e4f3a2b1c0d9e",
                role="penetration_tester",
                email="ghost@redcorp.cyber",
                pin="4102",
                is_active=True,
                notes="Offensive Security Specialist.",
            ),
            User(
                username="dev_kevin",
                password_hash="sha256$77ba119dc99$0f1e2d3c4b5a69788796a5",
                role="developer",
                email="kevin.backend@redcorp.cyber",
                pin="1337",
                is_active=True,
                notes="Wrote the legacy query without parameterized statements.",
            ),
            User(
                username="guest_visitor",
                password_hash="sha256$11111111111$guestpasswordhashdemo0001",
                role="guest",
                email="guest@redcorp.cyber",
                pin="0000",
                is_active=True,
                notes="Read-only demo account.",
            ),
        ]
        db.add_all(users)

        # 2. Seed Secret Credentials (High-value targets for UNION & data extraction)
        secrets = [
            SecretCredential(
                service_name="Mainframe Core Gateway",
                access_key="RED-CORP-GW-9011",
                secret_token="tok_live_99a81bc77209de445bf092",
                classification="TOP_SECRET_RED",
                flag_value="FLAG{UNION_DATA_EXFILTRATED_77}",
            ),
            SecretCredential(
                service_name="Orbital Satellite Uplink",
                access_key="SAT-GEO-X4",
                secret_token="tok_sat_44f8019a2c3b8e907d6a5f",
                classification="COSMIC_BLACK",
                flag_value="FLAG{ORBITAL_UPLINK_BREACHED_88}",
            ),
            SecretCredential(
                service_name="Quantum Key Distribution",
                access_key="QKD-NODE-ALPHA",
                secret_token="tok_qkd_1188339944bbccaaffee00",
                classification="RESTRICTED",
                flag_value="FLAG{QUANTUM_KEY_COMPROMISED_33}",
            ),
        ]
        db.add_all(secrets)

        # 3. Seed Products (Catalog with Public & Unlisted/Classified Items)
        products = [
            Product(
                sku="SKU-NEON-01",
                name="Cyberdeck Neural Interface Mk-IV",
                category="Hardware",
                description="Portable holographic terminal with fiber optic neural bridge and quantum co-processor.",
                price=4850.00,
                stock=14,
                is_public=True,
            ),
            Product(
                sku="SKU-NEON-02",
                name="Red Team Micro-Transceiver Array",
                category="Surveillance",
                description="RF sniffer capable of intercepting military-band frequency hopping signals.",
                price=1250.00,
                stock=42,
                is_public=True,
            ),
            Product(
                sku="SKU-NEON-03",
                name="Optical Camouflage Tactical Hoodie",
                category="Gear",
                description="Graphite-woven fiber that bends surveillance camera IR and visible spectrum light.",
                price=890.00,
                stock=88,
                is_public=True,
            ),
            Product(
                sku="SKU-NEON-04",
                name="Biometric Bypass Emulator v3",
                category="Exploit Tool",
                description="Capacitive fingerprint cloner and iris pattern spoofer.",
                price=3200.00,
                stock=5,
                is_public=True,
            ),
            Product(
                sku="SKU-CLASSIFIED-99",
                name="[CLASSIFIED] Chimera Zero-Day Kernel Rootkit",
                category="Black Budget Ops",
                description="Targeted stealth persistence framework with ring-0 kernel hooking. FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}",
                price=99999.00,
                stock=1,
                is_public=False,  # Unlisted! Found via search parameter SQLi
            ),
            Product(
                sku="SKU-CLASSIFIED-00",
                name="[INTERNAL ONLY] Dark Matter Autonomous C2 Beacon",
                category="Black Budget Ops",
                description="DNS-tunneling asynchronous payload with polymorphic beaconing.",
                price=50000.00,
                stock=2,
                is_public=False,
            ),
        ]
        db.add_all(products)

        # 4. Seed Employees
        employees = [
            Employee(
                badge_id="BADGE-001",
                full_name="Kira 'Zero' Vance",
                department="Offensive Security",
                clearance_level="Red-5 (Executive)",
                phone="+1 (555) 019-9011",
                internal_email="kira.vance@redcorp.cyber",
            ),
            Employee(
                badge_id="BADGE-042",
                full_name="Dr. Alexander Vance",
                department="Quantum Research",
                clearance_level="Red-4 (Research Lead)",
                phone="+1 (555) 019-4422",
                internal_email="a.vance@redcorp.cyber",
            ),
            Employee(
                badge_id="BADGE-099",
                full_name="Devin K. Cross",
                department="Application Development",
                clearance_level="Red-2 (Staff)",
                phone="+1 (555) 019-8833",
                internal_email="devin.c@redcorp.cyber",
            ),
            Employee(
                badge_id="BADGE-105",
                full_name="Sarah 'Cipher' Conner",
                department="Threat Intelligence",
                clearance_level="Red-3 (Analyst)",
                phone="+1 (555) 019-1144",
                internal_email="s.conner@redcorp.cyber",
            ),
        ]
        db.add_all(employees)

        # 5. Seed Orders (For Error-based testing)
        orders = [
            Order(
                order_code="ORD-901",
                customer_id=1,
                product_name="Cyberdeck Neural Interface Mk-IV",
                quantity=1,
                status="DISPATCHED",
                diagnostic_info="DiagCode:0x77A1; Build:2026.11; FLAG{ERROR_BASED_VERSION_LEAKED_55}",
            ),
            Order(
                order_code="ORD-902",
                customer_id=2,
                product_name="Optical Camouflage Tactical Hoodie",
                quantity=2,
                status="PROCESSING",
                diagnostic_info="DiagCode:0x12BC; System:SQLite-Internal; Telemetry:ACTIVE",
            ),
        ]
        db.add_all(orders)

        # 6. Seed Feedback (For Time-based blind testing)
        feedbacks = [
            Feedback(
                author="System Sentinel",
                subject="Diagnostic Telemetry Feed",
                comments="All core nodes operating within nominal cyber-defense parameters. FLAG{TIME_BASED_LATENCY_CRACKED_88}",
                sentiment="SECURE",
                created_at=datetime.now(timezone.utc),
            ),
            Feedback(
                author="External Auditor",
                subject="Annual Penetration Review",
                comments="Legacy database interfaces show dangerous vulnerability to string concatenation.",
                sentiment="CONCERN",
                created_at=datetime.now(timezone.utc),
            ),
        ]
        db.add_all(feedbacks)

        # 7. Seed Challenge Progress (All 7 Labs)
        challenges = [
            ChallengeProgress(
                lab_id="lab1_auth",
                title="Lab 1: Login Authentication Bypass",
                category="Authentication",
                difficulty="Beginner",
                completed=False,
                attempts=0,
                flag="FLAG{RED_TEAM_AUTH_BYPASS_99}",
            ),
            ChallengeProgress(
                lab_id="lab2_search",
                title="Lab 2: Search Parameter Injection",
                category="Data Disclosure",
                difficulty="Beginner",
                completed=False,
                attempts=0,
                flag="FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}",
            ),
            ChallengeProgress(
                lab_id="lab3_numeric",
                title="Lab 3: Product SKU Numeric Injection",
                category="Tautology",
                difficulty="Intermediate",
                completed=False,
                attempts=0,
                flag="FLAG{NUMERIC_ID_TAUTOLOGY_31}",
            ),
            ChallengeProgress(
                lab_id="lab4_union",
                title="Lab 4: UNION-Based Data Exfiltration",
                category="UNION Attack",
                difficulty="Advanced",
                completed=False,
                attempts=0,
                flag="FLAG{UNION_DATA_EXFILTRATED_77}",
            ),
            ChallengeProgress(
                lab_id="lab5_blind_bool",
                title="Lab 5: Boolean-Based Blind SQLi",
                category="Blind Inference",
                difficulty="Advanced",
                completed=False,
                attempts=0,
                flag="FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}",
            ),
            ChallengeProgress(
                lab_id="lab6_error",
                title="Lab 6: Error-Based Diagnostic Leak",
                category="Error Extraction",
                difficulty="Advanced",
                completed=False,
                attempts=0,
                flag="FLAG{ERROR_BASED_VERSION_LEAKED_55}",
            ),
            ChallengeProgress(
                lab_id="lab7_blind_time",
                title="Lab 7: Time-Based Blind Latency Probe",
                category="Blind Timing",
                difficulty="Expert",
                completed=False,
                attempts=0,
                flag="FLAG{TIME_BASED_LATENCY_CRACKED_88}",
            ),
        ]
        db.add_all(challenges)

        # 8. Seed Default WAF Rules
        waf_rules = [
            WafRuleRecord(
                rule_id="RULE-101",
                name="UNION SELECT Attack Signature",
                category="SQL Keyword",
                pattern=r"(?i)\bUNION\s+(?:ALL\s+)?SELECT\b",
                description="Detects classic UNION injection queries aimed at cross-table data exfiltration.",
                severity="CRITICAL",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-102",
                name="Tautology / Boolean Bypass (' OR 1=1)",
                category="Boolean Logic",
                pattern=r"(?i)('\s*(?:OR|AND)\s+['\"0-9\w]+\s*=\s*['\"0-9\w]+)|(\bOR\s+1\s*=\s*1\b)",
                description="Catches classic conditional authentication and query bypasses like ' OR 1=1 or ' OR 'a'='a.",
                severity="HIGH",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-103",
                name="SQL Comment Truncation (--, /*, #)",
                category="Syntax Obfuscation",
                pattern=r"(--|\/\*|\*\/|#)",
                description="Flags trailing comment tokens used to strip remainder of valid backend query clauses.",
                severity="MEDIUM",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-104",
                name="Time Delay & Benchmark Execution",
                category="Timing Attack",
                pattern=r"(?i)\b(SLEEP|BENCHMARK|PG_SLEEP|WAITFOR\s+DELAY|RANDOMBLOB)\s*\(",
                description="Identifies sleep and heavy computational delay calls used for time-based blind exfiltration.",
                severity="HIGH",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-105",
                name="Database Metadata & Schema Recon",
                category="Reconnaissance",
                pattern=r"(?i)\b(SQLITE_MASTER|INFORMATION_SCHEMA|SYS\.TABLES|SYSOBJECTS|ALL_TABLES)\b",
                description="Blocks queries attempting to fingerprint database schema catalogs and table structures.",
                severity="HIGH",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-106",
                name="Stacked Queries & Command Injection",
                category="Execution",
                pattern=r";\s*(?:DROP|ALTER|EXEC|INSERT|UPDATE|DELETE|SHUTDOWN)\b",
                description="Catches semicolon-delimited stacked queries attempting unauthorized DDL or DML.",
                severity="CRITICAL",
                is_enabled=True,
            ),
            WafRuleRecord(
                rule_id="RULE-107",
                name="Strict Single Quote Detection (Paranoid Only)",
                category="Input Character",
                pattern=r"['\"]",
                description="Ultra-strict quotation mark filter. High false positive rate on names (O'Connor) and text.",
                severity="LOW",
                is_enabled=False,  # Disabled by default; demonstrates false positives!
            ),
        ]
        db.add_all(waf_rules)

        db.commit()


def reset_database():
    """Wipes and re-seeds the entire database."""
    init_db(force=True)

