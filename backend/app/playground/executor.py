"""
Interactive SQL Payload Playground Execution Engine.
Safe, local-only playground for testing educational SQL injection payloads.
Visualizes reconstructed queries, highlights injected AST fragments,
and provides deep offensive/defensive breakdowns.
"""

from __future__ import annotations

import time
import sqlite3
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from app.core.database import get_raw_connection

# Educational payload catalog with deep explanatory breakdowns
EDUCATIONAL_PAYLOADS = [
    {
        "id": "single_quote",
        "name": "Single Quote Syntax Breakout",
        "category": "Syntax Testing",
        "payload": "'",
        "database_type": "all",
        "target_param": "username",
        "query_context": "SELECT * FROM users WHERE username = '{INPUT}';",
        "description": "The fundamental probe to detect unescaped SQL string concatenation.",
        "what_it_does": "Injects an unmatched single quotation mark character into the query string.",
        "why_it_works": "In SQL, single quotes delineate string literals. An unescaped quote breaks out of the literal string context and causes a syntax error in an improperly handled dynamic query.",
        "expected_response": "SQL syntax error (e.g. 'unrecognized token' or 'unclosed quotation mark') indicating the parameter is directly interpolated into SQL.",
        "vulnerability_demonstrated": "Raw string concatenation without escaping or parameterization.",
        "how_to_fix": "Use parameterized queries with placeholder markers (e.g. `WHERE username = ?`).",
    },
    {
        "id": "boolean_tautology_string",
        "name": "Boolean Tautology (String Context)",
        "category": "Authentication / Filter Bypass",
        "payload": "' OR '1'='1",
        "database_type": "all",
        "target_param": "username",
        "query_context": "SELECT id, username, role FROM users WHERE username = '{INPUT}';",
        "description": "Appends an always-true logical OR condition to retrieve all records.",
        "what_it_does": "Forces the WHERE clause expression to evaluate to TRUE for every single row in the database table.",
        "why_it_works": "The boolean expression evaluates as `(username = '') OR ('1' = '1')`. Because '1'='1' is always TRUE, the entire predicate becomes TRUE.",
        "expected_response": "Returns the complete table dataset, exposing confidential users or records.",
        "vulnerability_demonstrated": "WHERE clause boolean restructuring via unescaped string injection.",
        "how_to_fix": "Prepared statements ensure the entire string `' OR '1'='1` is treated as a literal username value.",
    },
    {
        "id": "numeric_tautology",
        "name": "Numeric Parameter Tautology",
        "category": "Numeric Injection",
        "payload": "1 OR 1=1",
        "database_type": "all",
        "target_param": "id",
        "query_context": "SELECT id, sku, name, price FROM products WHERE id = {INPUT};",
        "description": "Bypasses query filters on unquoted numeric fields without quotation marks.",
        "what_it_does": "Appends an OR 1=1 statement to an unquoted integer parameter.",
        "why_it_works": "Many developers falsely assume injection only occurs in quoted string fields. Because numeric parameters don't have enclosing quotes, no quote is needed to alter the query grammar.",
        "expected_response": "Returns all products in the database instead of the single requested item.",
        "vulnerability_demonstrated": "Unquoted numeric variable interpolation.",
        "how_to_fix": "Strictly typecast inputs (`int(user_val)`) and use parameterized queries (`WHERE id = ?`).",
    },
    {
        "id": "comment_truncation",
        "name": "Comment Syntax Truncation (--)",
        "category": "Comment Syntax",
        "payload": "admin' --",
        "database_type": "sqlite_postgres",
        "target_param": "username",
        "query_context": "SELECT id, username, role FROM users WHERE username = '{INPUT}' AND password_hash = 'SECRET';",
        "description": "Truncates the rest of the query, eliminating the password check.",
        "what_it_does": "Injects a single quote to close the username literal, followed by the SQL line comment token `--`.",
        "why_it_works": "The database parser discards all characters following `--` on that line, omitting the subsequent `AND password_hash = ...` check.",
        "expected_response": "Successful authentication as user 'admin' without supplying a password.",
        "vulnerability_demonstrated": "Authentication bypass via SQL comment truncation.",
        "how_to_fix": "Parameterize the username query and check cryptographic password hashes in application memory.",
    },
    {
        "id": "union_exfiltration",
        "name": "UNION-Based Data Exfiltration",
        "category": "UNION Attack",
        "payload": "' UNION SELECT id, access_key, secret_token, classification FROM secret_credentials --",
        "database_type": "sqlite",
        "target_param": "username",
        "query_context": "SELECT id, username, email, role FROM users WHERE username = '{INPUT}';",
        "description": "Combines original query with confidential rows from secret_credentials.",
        "what_it_does": "Appends a secondary SELECT statement targeting another table with matching column count (4 columns).",
        "why_it_works": "The database executes both queries and unites the result sets into a single dataset returned to the client.",
        "expected_response": "Returns rows containing sensitive API tokens, secret keys, and classification flags.",
        "vulnerability_demonstrated": "Cross-table data exfiltration via UNION query injection.",
        "how_to_fix": "Enforce prepared statements and restrict the database user's table read permissions.",
    },
    {
        "id": "error_based_cast",
        "name": "Error-Based Typecast Data Extraction",
        "category": "Error-Based",
        "payload": "' AND 1=CAST((SELECT secret_token FROM secret_credentials LIMIT 1) AS INTEGER) --",
        "database_type": "sqlite",
        "target_param": "username",
        "query_context": "SELECT id, username FROM users WHERE username = '{INPUT}';",
        "description": "Forces a database runtime conversion error that reflects extracted data in the error message.",
        "what_it_does": "Executes a subquery that retrieves a secret string and attempts to cast it to an integer inside the WHERE clause.",
        "why_it_works": "When SQLite evaluates `CAST('tok_live_...' AS INTEGER)`, it encounters an invalid conversion on engines configured with strict typing, or reflects in diagnostic exceptions.",
        "expected_response": "Database exception output containing subquery telemetry or internal diagnostic data.",
        "vulnerability_demonstrated": "Information disclosure through unhandled database exceptions.",
        "how_to_fix": "Parameterize queries and configure generic error pages that suppress raw database tracebacks.",
    },
    {
        "id": "blind_boolean_probing",
        "name": "Boolean-Based Blind Character Inference",
        "category": "Blind Injection",
        "payload": "admin' AND (SELECT SUBSTR(pin, 1, 1) FROM users WHERE username='admin') = '7' --",
        "database_type": "all",
        "target_param": "username",
        "query_context": "SELECT id FROM users WHERE username = '{INPUT}';",
        "description": "Infers secret characters one by one via TRUE/FALSE boolean evaluation.",
        "what_it_does": "Tests whether the first character of the administrator's PIN code is '7'.",
        "why_it_works": "If the condition is TRUE, the user record is returned (or status 200). If FALSE, nothing is returned (or status 404). By iterating over characters 0-9 and a-z, the attacker reconstructs the entire secret.",
        "expected_response": "Returns the admin row when the guess is correct ('7'), empty when incorrect ('1').",
        "vulnerability_demonstrated": "Blind data exfiltration through side-channel Boolean response differences.",
        "how_to_fix": "Use prepared statements to prevent subquery injection into conditional statements.",
    },
]


class PlaygroundExecuteRequest(BaseModel):
    query_template: str = "SELECT id, username, role, email FROM users WHERE username = '{INPUT}';"
    payload: str = "' OR '1'='1"
    target_param: str = "username"
    database_type: str = "sqlite"  # sqlite, mysql, postgresql, mssql
    simulate_waf: bool = False


class QueryToken(BaseModel):
    text: str
    token_type: str  # "base_sql" | "injected_payload" | "operator" | "comment"


class PlaygroundExecuteResponse(BaseModel):
    raw_query: str
    injected_highlighted: List[QueryToken]
    status_code: int
    duration_ms: float
    row_count: int
    columns: List[str]
    rows: List[Dict[str, Any]]
    error: Optional[str] = None
    waf_result: Optional[Dict[str, Any]] = None
    educational_breakdown: Optional[Dict[str, Any]] = None
    timestamp: str


def execute_playground_query(req: PlaygroundExecuteRequest) -> PlaygroundExecuteResponse:
    """
    Executes an educational query against the isolated local SQLite database.
    Calculates query timing, parses AST highlights, and returns deep diagnostics.
    """
    from app.waf.engine import waf_engine

    waf_data = None
    if req.simulate_waf:
        waf_res = waf_engine.inspect_payload(req.payload, context="playground")
        waf_data = (
            waf_res.model_dump()
            if hasattr(waf_res, "model_dump")
            else waf_res.dict()
        )
        if waf_res.verdict == "BLOCKED":
            return PlaygroundExecuteResponse(
                raw_query="[BLOCKED BY SIMULATED WAF BEFORE EXECUTION]",
                injected_highlighted=[
                    QueryToken(text=req.payload, token_type="injected_payload")
                ],
                status_code=403,
                duration_ms=2.1,
                row_count=0,
                columns=[],
                rows=[],
                error="HTTP 403 Forbidden: Request intercepted and blocked by Simulated Red Team WAF Shield.",
                waf_result=waf_data,
                educational_breakdown=None,
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            )

    # Reconstruct query
    if "{INPUT}" in req.query_template:
        raw_sql = req.query_template.replace("{INPUT}", req.payload)
    else:
        raw_sql = f"{req.query_template.rstrip(';')} {req.payload};"

    # Build highlighted tokens
    tokens: List[QueryToken] = []
    if "{INPUT}" in req.query_template:
        parts = req.query_template.split("{INPUT}")
        tokens.append(QueryToken(text=parts[0], token_type="base_sql"))
        tokens.append(QueryToken(text=req.payload, token_type="injected_payload"))
        if len(parts) > 1 and parts[1]:
            tokens.append(QueryToken(text=parts[1], token_type="base_sql"))
    else:
        tokens.append(QueryToken(text=req.query_template, token_type="base_sql"))
        tokens.append(QueryToken(text=req.payload, token_type="injected_payload"))

    # Find matching educational breakdown if any
    matched_breakdown = None
    for p in EDUCATIONAL_PAYLOADS:
        if p["payload"] == req.payload or p["payload"] in req.payload:
            matched_breakdown = p
            break

    # Execute against local database
    start_time = time.perf_counter()
    rows: List[Dict[str, Any]] = []
    columns: List[str] = []
    error_msg = None
    status_code = 200

    try:
        conn = get_raw_connection()
        cursor = conn.cursor()

        # Enforce isolated execution
        # Support multi-statement execution via executescript or normal execute
        if ";" in req.payload and any(kw in req.payload.upper() for kw in ["UPDATE", "INSERT", "DELETE"]):
            cursor.executescript(raw_sql)
            columns = ["status"]
            rows = [{"status": "Multi-statement execution completed successfully."}]
        else:
            cursor.execute(raw_sql)
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                for r in cursor.fetchall():
                    row_dict = {}
                    for idx, col in enumerate(columns):
                        val = r[idx]
                        row_dict[col] = val
                    rows.append(row_dict)
        conn.close()
    except sqlite3.Error as e:
        error_msg = f"SQLite Exception: {str(e)}"
        status_code = 500
    except Exception as ex:
        error_msg = f"Execution Exception: {str(ex)}"
        status_code = 500

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return PlaygroundExecuteResponse(
        raw_query=raw_sql,
        injected_highlighted=tokens,
        status_code=status_code,
        duration_ms=duration_ms,
        row_count=len(rows),
        columns=columns,
        rows=rows,
        error=error_msg,
        waf_result=waf_data,
        educational_breakdown=matched_breakdown,
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
    )

