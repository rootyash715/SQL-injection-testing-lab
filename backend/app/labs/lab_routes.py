"""
Intentionally Vulnerable Application Labs (Labs 1 through 7).
Includes side-by-side Vulnerable vs Secure implementation modes,
reconstructed query visualizers, flag verification, and step-by-step hints.
Localhost educational laboratory only.
"""

from __future__ import annotations

import time
import sqlite3
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from app.core.database import get_raw_connection
from app.waf.engine import waf_engine

router = APIRouter(prefix="/labs", tags=["Vulnerable Labs"])


class LabResponse(BaseModel):
    lab_id: str
    mode: str  # "vulnerable" | "secure"
    success: bool
    status_code: int
    duration_ms: float
    raw_query: str
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None
    flag: Optional[str] = None
    waf_alert: Optional[Dict[str, Any]] = None


def _to_dict(obj: Any) -> Dict[str, Any]:
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    return dict(obj)


# -----------------------------------------------------------------------------
# LAB 1: Login Authentication Bypass
# -----------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str
    mode: str = "vulnerable"  # "vulnerable" or "secure"
    enable_waf: bool = False


@router.post("/login", response_model=LabResponse)
def lab1_login(req: LoginRequest):
    """
    Lab 1: Authentication-based SQL injection.
    Objective: Bypass authentication without knowing the password to log in as 'admin'.
    """
    waf_data = None
    if req.enable_waf:
        waf_res = waf_engine.inspect_payload(req.username, context="login_username")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab1_auth",
                mode=req.mode,
                success=False,
                status_code=403,
                duration_ms=1.5,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: Malicious SQL pattern detected in username parameter.",
                error="HTTP 403 Forbidden: Red Team Cyber Shield intercepted request.",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if req.mode == "vulnerable":
        # Intentionally vulnerable string formatting
        raw_sql = f"SELECT id, username, role, email FROM users WHERE username = '{req.username}' AND password_hash = '{req.password}';"
        try:
            cursor.execute(raw_sql)
            user = cursor.fetchone()
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            if user:
                user_dict = dict(user)
                # Check if logged in as admin via exploit
                is_admin = user_dict.get("username") == "admin"
                flag = "FLAG{RED_TEAM_AUTH_BYPASS_99}" if is_admin else None
                return LabResponse(
                    lab_id="lab1_auth",
                    mode="vulnerable",
                    success=True,
                    status_code=200,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message=f"Access Granted! Authenticated as '{user_dict.get('username')}' ({user_dict.get('role')}).",
                    data=user_dict,
                    flag=flag,
                    waf_alert=waf_data,
                )
            else:
                return LabResponse(
                    lab_id="lab1_auth",
                    mode="vulnerable",
                    success=False,
                    status_code=401,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message="Authentication Failed: Invalid credentials.",
                    flag=None,
                    waf_alert=waf_data,
                )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab1_auth",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="Database syntax error occurred during dynamic query execution.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        # Secure parameterized query
        raw_sql = "SELECT id, username, role, email, password_hash FROM users WHERE username = ?;"
        cursor.execute(raw_sql, (req.username,))
        user = cursor.fetchone()
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        # In secure mode, parameter prevents bypass and password hash is compared
        if user and user["password_hash"] == req.password:
            user_dict = dict(user)
            user_dict.pop("password_hash", None)
            return LabResponse(
                lab_id="lab1_auth",
                mode="secure",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{req.username}',)",
                message=f"Secure Login Verified: Welcome {user_dict.get('username')}.",
                data=user_dict,
                flag=None,
                waf_alert=waf_data,
            )
        else:
            return LabResponse(
                lab_id="lab1_auth",
                mode="secure",
                success=False,
                status_code=401,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{req.username}',)",
                message="Secure Login Rejected: Parameter treated strictly as literal username.",
                flag=None,
                waf_alert=waf_data,
            )


# -----------------------------------------------------------------------------
# LAB 2: Search Parameter Injection
# -----------------------------------------------------------------------------
@router.get("/search", response_model=LabResponse)
def lab2_search(
    query: str,
    mode: str = "vulnerable",
    enable_waf: bool = False,
):
    """
    Lab 2: Search parameter SQLi inside LIKE clause.
    Objective: Uncover hidden/unlisted classified black-budget products.
    """
    waf_data = None
    if enable_waf:
        waf_res = waf_engine.inspect_payload(query, context="search_query")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab2_search",
                mode=mode,
                success=False,
                status_code=403,
                duration_ms=1.2,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: Blocked suspicious SQL pattern in search parameter.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if mode == "vulnerable":
        # Intentionally vulnerable LIKE interpolation
        raw_sql = f"SELECT id, sku, name, category, price, is_public FROM products WHERE is_public = 1 AND name LIKE '%{query}%';"
        try:
            cursor.execute(raw_sql)
            rows = [dict(r) for r in cursor.fetchall()]
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            # Check if classified unlisted items were exposed
            classified_exposed = any(not r.get("is_public") for r in rows)
            flag = "FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}" if classified_exposed else None

            return LabResponse(
                lab_id="lab2_search",
                mode="vulnerable",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=raw_sql,
                message=f"Found {len(rows)} products in catalog.",
                data=rows,
                flag=flag,
                waf_alert=waf_data,
            )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab2_search",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="SQL syntax error encountered.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        # Secure parameterized LIKE query
        raw_sql = "SELECT id, sku, name, category, price, is_public FROM products WHERE is_public = 1 AND name LIKE ?;"
        cursor.execute(raw_sql, (f"%{query}%",))
        rows = [dict(r) for r in cursor.fetchall()]
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        return LabResponse(
            lab_id="lab2_search",
            mode="secure",
            success=True,
            status_code=200,
            duration_ms=duration,
            raw_query=f"PREPARED: {raw_sql} with params: ('%{query}%',)",
            message=f"Found {len(rows)} public products safely.",
            data=rows,
            flag=None,
            waf_alert=waf_data,
        )


# -----------------------------------------------------------------------------
# LAB 3: Product ID Numeric Injection
# -----------------------------------------------------------------------------
@router.get("/product", response_model=LabResponse)
def lab3_product_id(
    id: str,
    mode: str = "vulnerable",
    enable_waf: bool = False,
):
    """
    Lab 3: Numeric parameter SQLi (No quotes needed).
    Objective: Dump all products by passing an unquoted tautology like `1 OR 1=1`.
    """
    waf_data = None
    if enable_waf:
        waf_res = waf_engine.inspect_payload(id, context="product_id")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab3_numeric",
                mode=mode,
                success=False,
                status_code=403,
                duration_ms=1.1,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: SQL expression in numeric parameter blocked.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if mode == "vulnerable":
        # Intentionally vulnerable numeric interpolation without quotes
        raw_sql = f"SELECT id, sku, name, category, price, stock FROM products WHERE id = {id};"
        try:
            cursor.execute(raw_sql)
            rows = [dict(r) for r in cursor.fetchall()]
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            # If more than 1 row returned from a single ID query, tautology succeeded!
            flag = "FLAG{NUMERIC_ID_TAUTOLOGY_31}" if len(rows) > 1 else None

            return LabResponse(
                lab_id="lab3_numeric",
                mode="vulnerable",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=raw_sql,
                message=f"Retrieved {len(rows)} inventory records.",
                data=rows,
                flag=flag,
                waf_alert=waf_data,
            )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab3_numeric",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="Database error executing numeric query.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        # Secure: Type validation + Parameterized statement
        try:
            safe_id = int(id)
        except ValueError:
            return LabResponse(
                lab_id="lab3_numeric",
                mode="secure",
                success=False,
                status_code=400,
                duration_ms=0.5,
                raw_query="Type validation failed before database execution.",
                message="Invalid parameter: Product ID must be a valid integer.",
                error="Type enforcement error: expected integer.",
                flag=None,
                waf_alert=waf_data,
            )

        raw_sql = "SELECT id, sku, name, category, price, stock FROM products WHERE id = ?;"
        cursor.execute(raw_sql, (safe_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        return LabResponse(
            lab_id="lab3_numeric",
            mode="secure",
            success=True,
            status_code=200,
            duration_ms=duration,
            raw_query=f"PREPARED: {raw_sql} with params: ({safe_id},)",
            message=f"Retrieved product {safe_id} securely.",
            data=rows,
            flag=None,
            waf_alert=waf_data,
        )


# -----------------------------------------------------------------------------
# LAB 4: UNION-Based Injection
# -----------------------------------------------------------------------------
@router.get("/employees", response_model=LabResponse)
def lab4_employees(
    department: str,
    mode: str = "vulnerable",
    enable_waf: bool = False,
):
    """
    Lab 4: UNION-based SQL injection.
    Objective: Extract credentials from `secret_credentials` by matching 3 columns.
    Base query returns 3 columns: badge_id, full_name, department.
    """
    waf_data = None
    if enable_waf:
        waf_res = waf_engine.inspect_payload(department, context="department")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab4_union",
                mode=mode,
                success=False,
                status_code=403,
                duration_ms=1.3,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: UNION statement detected.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if mode == "vulnerable":
        raw_sql = f"SELECT badge_id, full_name, department FROM employees WHERE department = '{department}';"
        try:
            cursor.execute(raw_sql)
            rows = [dict(r) for r in cursor.fetchall()]
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            # Check if secret credentials or flag were returned
            flag = None
            for row in rows:
                row_str = " ".join(str(v) for v in row.values())
                if "FLAG{" in row_str or "TOP_SECRET_RED" in row_str or "tok_live_" in row_str:
                    flag = "FLAG{UNION_DATA_EXFILTRATED_77}"
                    break

            return LabResponse(
                lab_id="lab4_union",
                mode="vulnerable",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=raw_sql,
                message=f"Directory returned {len(rows)} entries.",
                data=rows,
                flag=flag,
                waf_alert=waf_data,
            )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab4_union",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="UNION syntax error or column count mismatch.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        raw_sql = "SELECT badge_id, full_name, department FROM employees WHERE department = ?;"
        cursor.execute(raw_sql, (department,))
        rows = [dict(r) for r in cursor.fetchall()]
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        return LabResponse(
            lab_id="lab4_union",
            mode="secure",
            success=True,
            status_code=200,
            duration_ms=duration,
            raw_query=f"PREPARED: {raw_sql} with params: ('{department}',)",
            message=f"Directory returned {len(rows)} employees safely.",
            data=rows,
            flag=None,
            waf_alert=waf_data,
        )


# -----------------------------------------------------------------------------
# LAB 5: Boolean-Based Blind Injection
# -----------------------------------------------------------------------------
@router.get("/user-check", response_model=LabResponse)
def lab5_user_check(
    pin_guess: str,
    username: str = "admin",
    mode: str = "vulnerable",
    enable_waf: bool = False,
):
    """
    Lab 5: Boolean-based blind SQL injection.
    Objective: Deduce the admin's secret 4-digit PIN (which is '7492').
    Returns 'User Exists & Verified' when condition evaluates to TRUE,
    and 'User Not Found' when FALSE.
    """
    waf_data = None
    if enable_waf:
        waf_res = waf_engine.inspect_payload(pin_guess, context="pin_guess")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab5_blind_bool",
                mode=mode,
                success=False,
                status_code=403,
                duration_ms=1.1,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: Blind boolean payload detected.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if mode == "vulnerable":
        # Dynamic evaluation inside WHERE clause
        raw_sql = f"SELECT id, username FROM users WHERE username = '{username}' AND pin = '{pin_guess}';"
        try:
            cursor.execute(raw_sql)
            user = cursor.fetchone()
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            # Check if student guessed the full PIN or triggered boolean truth
            flag = None
            if pin_guess.strip() == "7492":
                flag = "FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}"

            if user:
                return LabResponse(
                    lab_id="lab5_blind_bool",
                    mode="vulnerable",
                    success=True,
                    status_code=200,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message="[BOOLEAN TRUE]: User Exists & Record Verified.",
                    data={"exists": True, "user_id": user["id"]},
                    flag=flag,
                    waf_alert=waf_data,
                )
            else:
                return LabResponse(
                    lab_id="lab5_blind_bool",
                    mode="vulnerable",
                    success=False,
                    status_code=404,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message="[BOOLEAN FALSE]: User Not Found / Invalid Condition.",
                    data={"exists": False},
                    flag=None,
                    waf_alert=waf_data,
                )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab5_blind_bool",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="SQL error during boolean evaluation.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        raw_sql = "SELECT id, username FROM users WHERE username = ? AND pin = ?;"
        cursor.execute(raw_sql, (username, pin_guess))
        user = cursor.fetchone()
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        flag = "FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}" if pin_guess == "7492" else None

        if user:
            return LabResponse(
                lab_id="lab5_blind_bool",
                mode="secure",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{username}', '{pin_guess}')",
                message="[SECURE]: PIN verified.",
                data={"exists": True},
                flag=flag,
                waf_alert=waf_data,
            )
        else:
            return LabResponse(
                lab_id="lab5_blind_bool",
                mode="secure",
                success=False,
                status_code=404,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{username}', '{pin_guess}')",
                message="[SECURE]: User not found.",
                data={"exists": False},
                flag=None,
                waf_alert=waf_data,
            )


# -----------------------------------------------------------------------------
# LAB 6: Error-Based Diagnostic Leak
# -----------------------------------------------------------------------------
@router.get("/order-status", response_model=LabResponse)
def lab6_order_status(
    order_code: str,
    mode: str = "vulnerable",
    enable_waf: bool = False,
):
    """
    Lab 6: Error-based SQL injection.
    Objective: Force an informative database error containing sensitive diagnostic info or flag.
    """
    waf_data = None
    if enable_waf:
        waf_res = waf_engine.inspect_payload(order_code, context="order_code")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab6_error",
                mode=mode,
                success=False,
                status_code=403,
                duration_ms=1.1,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: Error-based injection pattern blocked.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if mode == "vulnerable":
        raw_sql = f"SELECT order_code, product_name, status, diagnostic_info FROM orders WHERE order_code = '{order_code}';"
        try:
            cursor.execute(raw_sql)
            order = cursor.fetchone()
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            if order:
                order_dict = dict(order)
                flag = "FLAG{ERROR_BASED_VERSION_LEAKED_55}" if "FLAG{" in str(order_dict) else None
                return LabResponse(
                    lab_id="lab6_error",
                    mode="vulnerable",
                    success=True,
                    status_code=200,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message=f"Order {order_dict.get('order_code')} status retrieved.",
                    data=order_dict,
                    flag=flag,
                    waf_alert=waf_data,
                )
            else:
                return LabResponse(
                    lab_id="lab6_error",
                    mode="vulnerable",
                    success=False,
                    status_code=404,
                    duration_ms=duration,
                    raw_query=raw_sql,
                    message="Order code not found in tracking records.",
                    flag=None,
                    waf_alert=waf_data,
                )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            # Intentionally leak raw database exception trace
            err_str = str(e)
            flag = None
            if "diagnostic_info" in err_str or "secret" in err_str or "unrecognized" in err_str or "syntax" in err_str:
                flag = "FLAG{ERROR_BASED_VERSION_LEAKED_55}"

            return LabResponse(
                lab_id="lab6_error",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="[INTERNAL DISCLOSURE]: Unhandled Database Exception Encountered.",
                error=f"DEBUG TRACE: sqlite3.OperationalError: {err_str} in statement [{raw_sql}]",
                flag=flag,
                waf_alert=waf_data,
            )
    else:
        raw_sql = "SELECT order_code, product_name, status FROM orders WHERE order_code = ?;"
        cursor.execute(raw_sql, (order_code,))
        order = cursor.fetchone()
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        if order:
            return LabResponse(
                lab_id="lab6_error",
                mode="secure",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{order_code}',)",
                message="Order status retrieved securely without exposing internal diagnostics.",
                data=dict(order),
                flag=None,
                waf_alert=waf_data,
            )
        else:
            return LabResponse(
                lab_id="lab6_error",
                mode="secure",
                success=False,
                status_code=404,
                duration_ms=duration,
                raw_query=f"PREPARED: {raw_sql} with params: ('{order_code}',)",
                message="Order not found.",
                flag=None,
                waf_alert=waf_data,
            )


# -----------------------------------------------------------------------------
# LAB 7: Time-Based Blind Injection
# -----------------------------------------------------------------------------
class FeedbackRequest(BaseModel):
    author: str
    comments: str
    mode: str = "vulnerable"
    enable_waf: bool = False


@router.post("/feedback", response_model=LabResponse)
def lab7_feedback(req: FeedbackRequest):
    """
    Lab 7: Time-based blind SQL injection.
    Objective: Trigger a detectable time delay (e.g. sleep(2) or 2000ms+)
    to prove SQL execution through latency measurements.
    """
    waf_data = None
    if req.enable_waf:
        # Check both fields
        combined = f"{req.author} {req.comments}"
        waf_res = waf_engine.inspect_payload(combined, context="feedback_form")
        waf_data = _to_dict(waf_res)
        if waf_res.verdict == "BLOCKED":
            return LabResponse(
                lab_id="lab7_blind_time",
                mode=req.mode,
                success=False,
                status_code=403,
                duration_ms=1.4,
                raw_query="[BLOCKED BY SIMULATED WAF]",
                message="WAF Alert: Time delay function or benchmark detected.",
                error="HTTP 403 Forbidden",
                flag=None,
                waf_alert=waf_data,
            )

    start = time.perf_counter()
    conn = get_raw_connection()
    cursor = conn.cursor()

    if req.mode == "vulnerable":
        # Supports stacked queries or sleep function inside expression
        raw_sql = f"INSERT INTO feedback (author, comments) VALUES ('{req.author}', '{req.comments}');"
        try:
            # Check for injected sleep call or multi-statement
            if ";" in req.comments or "sleep" in req.comments.lower() or "sleep" in req.author.lower():
                cursor.executescript(raw_sql)
            else:
                cursor.execute(raw_sql)
            conn.commit()
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()

            # If execution took > 1500ms, student successfully induced time delay!
            flag = None
            if duration >= 1500:
                flag = "FLAG{TIME_BASED_LATENCY_CRACKED_88}"

            return LabResponse(
                lab_id="lab7_blind_time",
                mode="vulnerable",
                success=True,
                status_code=200,
                duration_ms=duration,
                raw_query=raw_sql,
                message=f"Feedback submitted successfully in {duration}ms.",
                data={"submitted": True, "measured_latency_ms": duration},
                flag=flag,
                waf_alert=waf_data,
            )
        except sqlite3.Error as e:
            duration = round((time.perf_counter() - start) * 1000, 2)
            conn.close()
            return LabResponse(
                lab_id="lab7_blind_time",
                mode="vulnerable",
                success=False,
                status_code=500,
                duration_ms=duration,
                raw_query=raw_sql,
                message="Database error executing feedback insertion.",
                error=str(e),
                flag=None,
                waf_alert=waf_data,
            )
    else:
        raw_sql = "INSERT INTO feedback (author, comments) VALUES (?, ?);"
        cursor.execute(raw_sql, (req.author, req.comments))
        conn.commit()
        duration = round((time.perf_counter() - start) * 1000, 2)
        conn.close()

        return LabResponse(
            lab_id="lab7_blind_time",
            mode="secure",
            success=True,
            status_code=200,
            duration_ms=duration,
            raw_query=f"PREPARED: {raw_sql} with params: ('{req.author}', '{req.comments[:20]}...')",
            message=f"Feedback securely saved in {duration}ms.",
            data={"submitted": True, "measured_latency_ms": duration},
            flag=None,
            waf_alert=waf_data,
        )


# -----------------------------------------------------------------------------
# Labs Catalog & Metadata
# -----------------------------------------------------------------------------
LABS_METADATA = [
    {
        "id": "lab1_auth",
        "title": "Lab 1: Login Authentication Bypass",
        "category": "Authentication",
        "difficulty": "Beginner",
        "target_endpoint": "/api/labs/login",
        "scenario": (
            "RedCorp Executive Portal guards internal offensive telemetry behind a single administrative login prompt. "
            "The backend Python code dynamically concatenates user-supplied strings directly into the authentication query."
        ),
        "learning_objective": "Bypass authentication without knowing the password to log in as user 'admin' and capture the access flag.",
        "testing_instructions": [
            "Set username to: admin' --",
            "Set password to any arbitrary value or leave empty.",
            "Observe how the SQL comment '--' truncates the remainder of the query.",
            "Compare the result with 'Secure Mode' toggled on.",
        ],
        "expected_behavior": "When vulnerable, returns HTTP 200 with admin role session and flag. When secure, returns HTTP 401.",
        "solution_explanation": "Injecting `admin' --` closes the username literal and turns the password check into a comment, forcing the database to return the admin row.",
        "secure_coding_alternative": (
            "cursor.execute(\"SELECT id, username, password_hash FROM users WHERE username = ?;\", (username,))\n"
            "user = cursor.fetchone()\n"
            "if user and bcrypt.checkpw(password.encode(), user['password_hash'].encode()):\n"
            "    login_user(user)"
        ),
        "flag": "FLAG{RED_TEAM_AUTH_BYPASS_99}",
    },
    {
        "id": "lab2_search",
        "title": "Lab 2: Search Parameter Injection (LIKE Clause)",
        "category": "Data Disclosure",
        "difficulty": "Beginner",
        "target_endpoint": "/api/labs/search",
        "scenario": (
            "The RedCorp Asset Catalog search function allows employees to find public equipment. "
            "However, classified black-budget military cyber tools are flagged with `is_public = 0`."
        ),
        "learning_objective": "Exploit the dynamic LIKE clause to bypass the `is_public = 1` constraint and uncover classified unlisted assets.",
        "testing_instructions": [
            "Search for: ' OR 1=1 --",
            "Notice how the injected OR 1=1 bypasses both the keyword match and the is_public constraint.",
            "Examine the revealed item: '[CLASSIFIED] Chimera Zero-Day Kernel Rootkit'.",
        ],
        "expected_behavior": "Returns unlisted items with `is_public=False` and the captured flag.",
        "solution_explanation": "The injected `' OR 1=1 --` changes the query logic from `WHERE is_public=1 AND name LIKE '%x%'` to `WHERE is_public=1 AND name LIKE '%' OR 1=1 --%`, making every row evaluate TRUE.",
        "secure_coding_alternative": (
            "cursor.execute(\"SELECT * FROM products WHERE is_public = 1 AND name LIKE ?;\", (f\"%{query}%\",))"
        ),
        "flag": "FLAG{SEARCH_UNLISTED_ASSET_FOUND_42}",
    },
    {
        "id": "lab3_numeric",
        "title": "Lab 3: Product SKU Numeric Injection",
        "category": "Tautology",
        "difficulty": "Intermediate",
        "target_endpoint": "/api/labs/product",
        "scenario": (
            "The inventory inspector looks up product specifications using a numeric ID parameter. "
            "Because the parameter is numeric, the developer omitted quotation marks in the SQL query."
        ),
        "learning_objective": "Prove that SQL injection does not require quotation marks by injecting an unquoted numeric tautology.",
        "testing_instructions": [
            "Set ID to: 1 OR 1=1",
            "Observe that no single quote was required to break out of syntax.",
            "Verify that all items in the inventory table are returned simultaneously.",
        ],
        "expected_behavior": "Dumps all products instead of just one product ID.",
        "solution_explanation": "Because `id` is unquoted in `WHERE id = {id}`, injecting `1 OR 1=1` results in `WHERE id = 1 OR 1=1`, which evaluates to TRUE for all rows.",
        "secure_coding_alternative": (
            "try:\n"
            "    product_id = int(user_input) # Strict typecast\n"
            "except ValueError:\n"
            "    raise HTTPException(status_code=400, detail='Invalid integer ID')\n"
            "cursor.execute(\"SELECT * FROM products WHERE id = ?;\", (product_id,))"
        ),
        "flag": "FLAG{NUMERIC_ID_TAUTOLOGY_31}",
    },
    {
        "id": "lab4_union",
        "title": "Lab 4: UNION-Based Data Exfiltration",
        "category": "UNION Attack",
        "difficulty": "Advanced",
        "target_endpoint": "/api/labs/employees",
        "scenario": (
            "The Public Employee Directory displays employee badge IDs, full names, and departments. "
            "A separate restricted table named `secret_credentials` holds confidential API tokens."
        ),
        "learning_objective": "Determine the column count (3 columns) and perform a UNION SELECT attack to extract records from `secret_credentials`.",
        "testing_instructions": [
            "Try injecting: ' ORDER BY 3 -- (Succeeds)",
            "Try injecting: ' ORDER BY 4 -- (Fails with column error, confirming 3 columns)",
            "Inject payload: ' UNION SELECT id, access_key, secret_token FROM secret_credentials --",
            "Inspect the exfiltrated rows containing TOP_SECRET_RED keys.",
        ],
        "expected_behavior": "The directory outputs the secret credentials table rows embedded in the employee list.",
        "solution_explanation": "Matching the 3 columns of the original query allows UNION to append rows from the high-value `secret_credentials` table.",
        "secure_coding_alternative": (
            "cursor.execute(\"SELECT badge_id, full_name, department FROM employees WHERE department = ?;\", (dept,))"
        ),
        "flag": "FLAG{UNION_DATA_EXFILTRATED_77}",
    },
    {
        "id": "lab5_blind_bool",
        "title": "Lab 5: Boolean-Based Blind SQL Injection",
        "category": "Blind Inference",
        "difficulty": "Advanced",
        "target_endpoint": "/api/labs/user-check",
        "scenario": (
            "The user verification endpoint does not render database records or error messages. "
            "It only states whether a user exists ('User Exists & Verified' vs 'User Not Found')."
        ),
        "learning_objective": "Infer the administrator's secret 4-digit PIN ('7492') by testing boolean true/false conditions.",
        "testing_instructions": [
            "Test first digit: ' OR (SELECT SUBSTR(pin,1,1) FROM users WHERE username='admin')='7' -- (Returns TRUE!)",
            "Test second digit: ' OR (SELECT SUBSTR(pin,2,1) FROM users WHERE username='admin')='4' -- (Returns TRUE!)",
            "Submit the full PIN: 7492 to capture the flag.",
        ],
        "expected_behavior": "Returns HTTP 200 with 'User Exists' on TRUE condition and HTTP 404 on FALSE condition.",
        "solution_explanation": "Boolean blind SQLi exploits subtle differences in application responses to leak data bit by bit without needing direct output.",
        "secure_coding_alternative": (
            "cursor.execute(\"SELECT id FROM users WHERE username = ? AND pin = ?;\", (username, pin))"
        ),
        "flag": "FLAG{BLIND_BOOLEAN_PIN_DISCOVERED}",
    },
    {
        "id": "lab6_error",
        "title": "Lab 6: Error-Based Diagnostic Leak",
        "category": "Error Extraction",
        "difficulty": "Advanced",
        "target_endpoint": "/api/labs/order-status",
        "scenario": (
            "The order status diagnostic portal has verbose debug mode enabled. "
            "Database exceptions are printed directly in the HTTP 500 response body."
        ),
        "learning_objective": "Trigger a database exception to disclose diagnostic info and capture the hidden flag.",
        "testing_instructions": [
            "Inject unmatched quote: '",
            "Notice the detailed SQLite error trace returned in the response.",
            "Query an existing order with injected single quote breakout to inspect internal diagnostic fields: ORD-901' OR 1=1 --",
        ],
        "expected_behavior": "Unhandled database exception disclosures reveal query structure and internal telemetry.",
        "solution_explanation": "Improper error handling exposes stack traces and query syntax to attackers, facilitating reverse engineering of the database.",
        "secure_coding_alternative": (
            "try:\n"
            "    cursor.execute(\"SELECT * FROM orders WHERE order_code = ?;\", (code,))\n"
            "except Exception as e:\n"
            "    logger.error('Database query failed', exc_info=True)\n"
            "    raise HTTPException(status_code=500, detail='An internal error occurred. Please contact support.')"
        ),
        "flag": "FLAG{ERROR_BASED_VERSION_LEAKED_55}",
    },
    {
        "id": "lab7_blind_time",
        "title": "Lab 7: Time-Based Blind Latency Probe",
        "category": "Blind Timing",
        "difficulty": "Expert",
        "target_endpoint": "/api/labs/feedback",
        "scenario": (
            "The security feedback submission form asynchronously logs comments into an internal database. "
            "The endpoint returns the exact same success response regardless of input."
        ),
        "learning_objective": "Induce a measurable server latency delay of 2000ms+ using SQLite sleep functions to verify execution.",
        "testing_instructions": [
            "Submit normal feedback: latency is ~10-25ms.",
            "Submit comment payload: Test'; SELECT sleep(2); --",
            "Observe that the response duration jumps to 2000ms+, proving SQL injection via timing side-channel.",
        ],
        "expected_behavior": "Measurable response latency confirms conditional execution.",
        "solution_explanation": "When an application produces no visual differences, injecting sleep functions allows attackers to extract data via clock timing.",
        "secure_coding_alternative": (
            "cursor.execute(\"INSERT INTO feedback (author, comments) VALUES (?, ?);\", (author, comments))"
        ),
        "flag": "FLAG{TIME_BASED_LATENCY_CRACKED_88}",
    },
]


@router.get("/catalog")
def get_labs_catalog():
    return LABS_METADATA
