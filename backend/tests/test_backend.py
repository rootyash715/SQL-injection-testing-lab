"""
Automated unit tests for SQL Injection Lab.
Tests all 7 vulnerable labs, WAF engine, Playground queries, and curriculum.
"""

from app.core.database import init_db
from app.labs.lab_routes import (
    lab1_login, LoginRequest,
    lab2_search,
    lab3_product_id,
    lab4_employees,
    lab5_user_check,
    lab6_order_status,
    lab7_feedback, FeedbackRequest,
    LABS_METADATA,
)
from app.waf.engine import waf_engine
from app.playground.executor import execute_playground_query, PlaygroundExecuteRequest
from app.modules.curriculum import get_all_lessons


def setup_function():
    init_db(force=True)


def test_curriculum_modules():
    lessons = get_all_lessons()
    assert len(lessons) == 13
    assert lessons[0]["slug"] == "sqli-fundamentals"
    assert lessons[12]["slug"] == "waf-fundamentals"


def test_labs_metadata_catalog():
    assert len(LABS_METADATA) == 7
    ids = [lab["id"] for lab in LABS_METADATA]
    assert "lab1_auth" in ids
    assert "lab7_blind_time" in ids


def test_lab1_login_auth():
    # Vulnerable mode: bypass authentication
    res = lab1_login(LoginRequest(username="admin' --", password="xyz", mode="vulnerable"))
    assert res.success is True
    assert res.data["username"] == "admin"
    assert res.flag == "FLAG{RED_TEAM_AUTH_BYPASS_99}"

    # Secure mode: should reject
    sec = lab1_login(LoginRequest(username="admin' --", password="xyz", mode="secure"))
    assert sec.success is False


def test_lab2_search():
    res = lab2_search(query="' OR 1=1 --", mode="vulnerable")
    assert res.success is True
    assert res.flag == "FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}"

    sec = lab2_search(query="' OR 1=1 --", mode="secure")
    assert sec.flag is None


def test_lab3_numeric():
    res = lab3_product_id(id="1 OR 1=1", mode="vulnerable")
    assert res.success is True
    assert len(res.data) > 1
    assert res.flag == "FLAG{NUMERIC_ID_TAUTOLOGY_31}"


def test_lab4_union():
    res = lab4_employees(
        department="' UNION SELECT id, access_key, secret_token FROM secret_credentials --",
        mode="vulnerable",
    )
    assert res.success is True
    assert res.flag == "FLAG{UNION_DATA_EXFILTRATED_77}"


def test_lab5_boolean_blind():
    res = lab5_user_check(username="admin", pin_guess="7492", mode="vulnerable")
    assert res.success is True
    assert res.flag == "FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}"


def test_lab6_error_based():
    res = lab6_order_status(order_code="'", mode="vulnerable")
    assert res.flag == "FLAG{ERROR_BASED_VERSION_LEAKED_55}"


def test_lab7_time_based():
    res = lab7_feedback(FeedbackRequest(author="tester", comments="test'); SELECT sleep(1.6); --", mode="vulnerable"))
    assert res.duration_ms >= 1500
    assert res.flag == "FLAG{TIME_BASED_LATENCY_CRACKED_88}"


def test_waf_inspection():
    blocked = waf_engine.inspect_payload("' UNION SELECT 1,2,3 --")
    assert blocked.verdict == "BLOCKED"
    assert blocked.status_code == 403

    allowed = waf_engine.inspect_payload("Innocent product query")
    assert allowed.verdict == "ALLOWED"
    assert allowed.status_code == 200


def test_playground_execution():
    res = execute_playground_query(
        PlaygroundExecuteRequest(
            query_template="SELECT id, username FROM users WHERE username = '{INPUT}';",
            payload="' OR '1'='1",
            target_param="username",
        )
    )
    assert res.row_count > 1
    assert res.status_code == 200
