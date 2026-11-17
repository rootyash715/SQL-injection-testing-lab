"""
Comprehensive SQL Injection Learning Curriculum (13 Core Modules).
Contains in-depth offensive and defensive explanations, AST query diagrams,
interactive sandbox scenarios, expected outputs, common mistakes, and mitigations.
"""

from typing import List, Dict, Any
from pydantic import BaseModel


class LessonInteractiveDemo(BaseModel):
    query_template: str
    vulnerable_input: str
    secure_input: str
    target_table: str
    expected_output_vulnerable: str
    expected_output_secure: str
    live_test_api: str  # API endpoint for in-lesson live execution


class Lesson(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    difficulty: str  # Beginner, Intermediate, Advanced, Expert
    summary: str
    explanation: str
    sql_example_vulnerable: str
    sql_example_secure: str
    ast_explanation: str
    interactive_demo: LessonInteractiveDemo
    expected_output: str
    common_mistakes: List[str]
    mitigation_techniques: List[str]


LESSONS: List[Lesson] = [
    Lesson(
        id=1,
        slug="sqli-fundamentals",
        title="1. SQL Injection Fundamentals",
        category="Foundations",
        difficulty="Beginner",
        summary="Understanding the boundary violation between code and user data in relational databases.",
        explanation=(
            "SQL Injection (SQLi) is an injection flaw ranked high in the OWASP Top 10. "
            "It occurs when untrusted user input is directly concatenated or interpolated into a "
            "dynamically constructed SQL query string without proper parameterization or sanitization. "
            "When the database SQL parser interprets the statement, user-supplied punctuation (such as "
            "single quotes `'` or comments `--`) alters the Abstract Syntax Tree (AST) of the query, "
            "causing the database engine to execute commands unintended by the application developer."
        ),
        sql_example_vulnerable="query = \"SELECT * FROM users WHERE username = '\" + user_input + \"';\"",
        sql_example_secure="cursor.execute(\"SELECT * FROM users WHERE username = ?;\", (user_input,))",
        ast_explanation=(
            "Vulnerable AST: Root -> SELECT -> WHERE -> (EQUALS(username, 'admin') OR EQUALS(1, 1)).\n"
            "The parser's Boolean evaluation subtree gets restructured from a single equality test to a tautology."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT id, username, role FROM users WHERE username = '{INPUT}';",
            vulnerable_input="' OR '1'='1",
            secure_input="admin",
            target_table="users",
            expected_output_vulnerable="Returns all rows from the users table, bypassing the username condition entirely.",
            expected_output_secure="Returns solely the matching record for username='admin'.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Bypasses filtering conditions and dumps all records in the table.",
        common_mistakes=[
            "Assuming frontend HTML form validation prevents malicious SQL tokens.",
            "Using blacklists or stripping single quotes (easily bypassed via encoding or numeric parameters).",
            "Believing stored procedures or ORMs are automatically immune without parameterized bindings.",
        ],
        mitigation_techniques=[
            "Always use parameterized queries (prepared statements).",
            "Employ modern ORMs with typed parameter binding.",
            "Enforce strict principle of least privilege on database connection credentials.",
        ],
    ),
    Lesson(
        id=2,
        slug="how-queries-work",
        title="2. How SQL Queries Work: Parsing, Planning & Execution",
        category="Architecture",
        difficulty="Beginner",
        summary="A look under the hood: Tokenization, Grammar Parsing, Query Optimization, and Execution Plans.",
        explanation=(
            "When a database engine receives a SQL statement over the wire, it passes through four distinct phases:\n"
            "1. Lexical Analysis (Scanner/Tokenizer): Breaks raw characters into tokens (keywords, literals, operators).\n"
            "2. Syntactic Analysis (Parser): Validates grammar and builds an Abstract Syntax Tree (AST).\n"
            "3. Query Planner & Optimizer: Analyzes index statistics, cost models, and generates an optimal physical plan.\n"
            "4. Query Execution Engine: Iterates over storage engine pages and returns the result cursor.\n\n"
            "In a vulnerable dynamic string query, parsing happens AFTER user input is concatenated, meaning malicious characters "
            "become grammar tokens. In a prepared statement, parsing happens FIRST: the AST structure is fixed with placeholder slots, "
            "and parameters are bound strictly as literal data values during execution."
        ),
        sql_example_vulnerable="SELECT * FROM products WHERE id = " + "{INPUT}",
        sql_example_secure="SELECT * FROM products WHERE id = ? -- Precompiled AST node",
        ast_explanation=(
            "Parameterized Query AST:\n"
            "SELECT (columns: *) -> FROM (table: products) -> WHERE (BinaryOp: id == $1)\n"
            "Even if $1 contains '1 OR 1=1', it remains an atomic scalar string or integer operand."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT sku, name, price FROM products WHERE id = {INPUT};",
            vulnerable_input="1 OR 1=1",
            secure_input="1",
            target_table="products",
            expected_output_vulnerable="The parser sees the OR token as part of the query grammar, evaluating TRUE for every row.",
            expected_output_secure="The database searches for a product whose ID is numerically 1.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Demonstrates how unquoted numeric input alters the query grammar without needing quotes.",
        common_mistakes=[
            "Thinking SQL injection only happens inside single quotation marks.",
            "Failing to understand that numeric parameters do not require quotation breakout.",
            "Relying on database query caching to mitigate injection.",
        ],
        mitigation_techniques=[
            "Typecast numeric variables explicitly at application boundaries (e.g. `int(input_val)`).",
            "Use typed parameterized SQL queries.",
            "Validate inputs against strict integer schemas.",
        ],
    ),
    Lesson(
        id=3,
        slug="auth-bypass",
        title="3. Authentication-Based SQL Injection",
        category="Exploitation",
        difficulty="Beginner",
        summary="Manipulating login WHERE clauses to authenticate as administrator without credentials.",
        explanation=(
            "Authentication queries typically take the form:\n"
            "`SELECT * FROM users WHERE username = '...' AND password_hash = '...'`\n"
            "By injecting a string like `admin' --`, the query becomes:\n"
            "`SELECT * FROM users WHERE username = 'admin' --' AND password_hash = '...'`\n"
            "The `--` sequence signifies a line comment in standard SQL. The database disregards the password verification entirely, "
            "returning the administrator's user row. The application checks `if user_row: return login_success`, granting full administrative access."
        ),
        sql_example_vulnerable="f\"SELECT * FROM users WHERE username = '{user}' AND password_hash = '{pwd}';\"",
        sql_example_secure="cursor.execute(\"SELECT * FROM users WHERE username = ?;\", (user,)) # Then verify hash via bcrypt",
        ast_explanation=(
            "The comment token truncates the right-hand child of the AND operator in the syntax tree, "
            "collapsing the expression to only verify the username."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT id, username, role FROM users WHERE username = '{INPUT}' AND password_hash = 'secret_hash';",
            vulnerable_input="admin' --",
            secure_input="admin",
            target_table="users",
            expected_output_vulnerable="Login successful as 'admin' (password check was commented out).",
            expected_output_secure="Login failed (password_hash did not match).",
            live_test_api="/api/labs/login",
        ),
        expected_output="Direct session hijacking without valid authentication credentials.",
        common_mistakes=[
            "Hashing user-supplied password in Python and then concatenating into SQL.",
            "Believing an empty password field protects against auth bypass.",
            "Checking only `len(rows) > 0` instead of cryptographically verifying password hashes with argon2/bcrypt.",
        ],
        mitigation_techniques=[
            "Look up the user solely by parameterized username: `SELECT password_hash FROM users WHERE username = ?`",
            "Perform password verification in application memory using standard constant-time hashing algorithms (Argon2id or bcrypt).",
            "Implement multi-factor authentication (MFA) to prevent single-factor account takeover.",
        ],
    ),
    Lesson(
        id=4,
        slug="error-based-sqli",
        title="4. Error-Based SQL Injection",
        category="Exploitation",
        difficulty="Intermediate",
        summary="Intentionally inducing database runtime errors that disclose sensitive internal data.",
        explanation=(
            "Error-based SQL injection is used when an application renders raw database error messages or tracebacks to the user. "
            "Attackers craft inputs that force the database to evaluate an invalid operation (such as casting a sensitive string to an integer, "
            "or mathematical overflow) that embeds the queried data inside the error message itself.\n\n"
            "In SQLite, expressions like `1 = CAST((SELECT flag_value FROM secret_credentials LIMIT 1) AS INTEGER)` or "
            "group-by duplicate key errors in MySQL can reflect data directly in error messages."
        ),
        sql_example_vulnerable="f\"SELECT * FROM orders WHERE order_code = '{code}'\"",
        sql_example_secure="cursor.execute(\"SELECT * FROM orders WHERE order_code = ?\", (code,))",
        ast_explanation=(
            "The injected subquery executes within the WHERE clause evaluation. When the conversion fails, "
            "the database raises an exception containing the operand value."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT order_code, product_name, status FROM orders WHERE order_code = '{INPUT}';",
            vulnerable_input="' AND 1=CAST((SELECT secret_token FROM secret_credentials LIMIT 1) AS INT) --",
            secure_input="ORD-901",
            target_table="orders",
            expected_output_vulnerable="Database error disclosed containing secret token or diagnostic trace.",
            expected_output_secure="Standard query returns order ORD-901 safely.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Discloses confidential database contents within unhandled exception tracebacks.",
        common_mistakes=[
            "Enabling debug mode (`DEBUG=True`) or verbose database error reporting in production.",
            "Displaying `str(e)` directly in HTTP 500 error responses.",
            "Assuming that because data isn't printed in the table, it cannot be leaked via errors.",
        ],
        mitigation_techniques=[
            "Disable database-level verbose error reporting to end users.",
            "Catch exceptions and log technical error traces securely into internal server logs only.",
            "Use parameterized SQL queries so input can never trigger subquery evaluation.",
        ],
    ),
    Lesson(
        id=5,
        slug="union-based-sqli",
        title="5. UNION-Based SQL Injection",
        category="Exploitation",
        difficulty="Intermediate",
        summary="Combining the results of the original query with an attacker-crafted SELECT statement.",
        explanation=(
            "The SQL `UNION` operator allows developers to combine the result sets of two or more `SELECT` queries into a single response. "
            "For a UNION attack to succeed, two mathematical conditions must be met:\n"
            "1. The injected query must return the exact same number of columns as the original query.\n"
            "2. The data types of corresponding columns must be compatible.\n\n"
            "Attackers typically determine the column count using `ORDER BY 1`, `ORDER BY 2` until an error occurs, or by attempting "
            "`UNION SELECT NULL, NULL, ...`. Once column count and string injection slots are found, attackers extract arbitrary tables."
        ),
        sql_example_vulnerable="f\"SELECT id, name, department FROM employees WHERE department = '{dept}'\"",
        sql_example_secure="cursor.execute(\"SELECT id, name, department FROM employees WHERE department = ?\", (dept,))",
        ast_explanation=(
            "A UNION AST node joins two independent SELECT statement trees, merging their cursor stream."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT badge_id, full_name, department FROM employees WHERE department = '{INPUT}';",
            vulnerable_input="' UNION SELECT id, access_key, secret_token FROM secret_credentials --",
            secure_input="Offensive Security",
            target_table="employees",
            expected_output_vulnerable="Appends rows from secret_credentials directly into the employee directory table output.",
            expected_output_secure="Returns only employees belonging to Offensive Security.",
            live_test_api="/api/labs/employees",
        ),
        expected_output="Mass cross-table data exfiltration across disparate tables.",
        common_mistakes=[
            "Filtering only `SELECT` without filtering `UNION`.",
            "Assuming that because an API only queries 'employees', other tables are safe.",
            "Relying on column name obfuscation instead of parameterization.",
        ],
        mitigation_techniques=[
            "Adopt parameterized queries across all database drivers.",
            "Apply principle of least privilege: the database user should not have read access to unrelated sensitive tables.",
            "Implement API response schema validation.",
        ],
    ),
    Lesson(
        id=6,
        slug="boolean-blind-sqli",
        title="6. Boolean-Based Blind SQL Injection",
        category="Exploitation",
        difficulty="Advanced",
        summary="Inferring data bit-by-bit when no SQL errors or query results are rendered.",
        explanation=(
            "In blind SQL injection scenarios, the web application does not output query data or error messages. "
            "However, the application may return a subtly different response depending on whether the injected condition evaluates to TRUE or FALSE "
            "(for example, 'User exists' vs 'User not found', or HTTP 200 vs HTTP 404).\n\n"
            "By asking the database binary TRUE/FALSE questions using string manipulation functions like `SUBSTR()` or `ASCII()`, "
            "an attacker can extract passwords, PINs, and secret keys one character at a time using binary search algorithms."
        ),
        sql_example_vulnerable="f\"SELECT 1 FROM users WHERE username = 'admin' AND pin = '{pin}'\"",
        sql_example_secure="cursor.execute(\"SELECT 1 FROM users WHERE username = 'admin' AND pin = ?\", (pin,))",
        ast_explanation=(
            "The WHERE clause condition evaluates dynamically. When the subquery matches, the whole condition is TRUE, "
            "yielding a positive response from the application."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT 1 FROM users WHERE username = 'admin' AND SUBSTR(pin, 1, 1) = '{INPUT}';",
            vulnerable_input="7",
            secure_input="1",
            target_table="users",
            expected_output_vulnerable="Status returns 'User Verified / Exists' because the first digit of admin's PIN is 7.",
            expected_output_secure="Status returns 'User Not Found' because the guessed digit is incorrect.",
            live_test_api="/api/labs/user-check",
        ),
        expected_output="Exfiltrates arbitrary records through repeated Boolean side-channel inference.",
        common_mistakes=[
            "Thinking that hiding database error messages prevents SQL injection entirely.",
            "Relying on generic error pages while leaving subtle boolean differences in HTML content.",
            "Believing blind attacks are impractical (automated tools crack hundreds of characters per minute).",
        ],
        mitigation_techniques=[
            "Enforce prepared statements unconditionally.",
            "Ensure invariant response messages across authentication checks.",
            "Implement rate limiting and account lockout after repeated automated probes.",
        ],
    ),
    Lesson(
        id=7,
        slug="time-based-blind-sqli",
        title="7. Time-Based Blind SQL Injection",
        category="Exploitation",
        difficulty="Expert",
        summary="Measuring server response latency when the application yields identical visual responses.",
        explanation=(
            "When an application returns identical content and HTTP status codes regardless of query success or failure, "
            "attackers measure the time the database engine takes to process the request. By injecting conditional delay functions "
            "(such as `SLEEP()`, `pg_sleep()`, or heavy recursive operations), an attacker observes whether the response takes "
            "seconds longer to return.\n\n"
            "If `IF(condition, SLEEP(3), 0)` takes ~3 seconds, the condition was TRUE. If it returns instantly, the condition was FALSE."
        ),
        sql_example_vulnerable="f\"INSERT INTO feedback (author, comments) VALUES ('{author}', '{comments}')\"",
        sql_example_secure="cursor.execute(\"INSERT INTO feedback (author, comments) VALUES (?, ?)\", (author, comments))",
        ast_explanation=(
            "The delay function is placed inside a conditional expression. The engine executes the sleep timer "
            "only when the predicate branch is reached."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT 1 WHERE 1=1 AND (CASE WHEN (1=1) THEN sleep(2) ELSE 0 END);",
            vulnerable_input="'; SELECT CASE WHEN (1=1) THEN sleep(2) ELSE 0 END; --",
            secure_input="Normal feedback text",
            target_table="feedback",
            expected_output_vulnerable="Response delay is measured at 2000ms+ (proves condition was true).",
            expected_output_secure="Response returns immediately in < 25ms.",
            live_test_api="/api/labs/feedback",
        ),
        expected_output="Exfiltrates data through precision timing measurements.",
        common_mistakes=[
            "Assuming asymmetric/blind endpoints (like feedback forms or log sinks) cannot be exploited.",
            "Not configuring aggressive database statement timeouts.",
            "Failing to monitor anomalous slow query logs in application monitoring tools.",
        ],
        mitigation_techniques=[
            "Always use parameterized queries for INSERT and UPDATE statements.",
            "Set strict query execution timeouts at the database server and connection pool level.",
            "Monitor web server response latency anomalies.",
        ],
    ),
    Lesson(
        id=8,
        slug="second-order-sqli",
        title="8. Second-Order SQL Injection",
        category="Advanced Concepts",
        difficulty="Advanced",
        summary="Payload stored safely in the database during step one, detonated during step two.",
        explanation=(
            "Second-order SQL injection occurs when user input is stored safely in the database (or properly escaped upon initial insertion), "
            "but is later retrieved and incorporated into a second dynamic SQL query without parameterization.\n\n"
            "Classic Scenario: A user registers with the username `admin' --`. The registration query uses a prepared statement, so the literal "
            "username `admin' --` is saved into the database table. Later, an administrator password reset or profile update script executes: "
            "`UPDATE users SET password = 'new' WHERE username = '\" + stored_user + \"'`.\n"
            "The stored single quote detonates inside the second query, resetting the genuine admin's password!"
        ),
        sql_example_vulnerable=(
            "# Step 1 (Safe): db.execute(\"INSERT INTO users VALUES (?)\", (input_name,))\n"
            "# Step 2 (Vulnerable): db.execute(f\"UPDATE profiles SET status='ok' WHERE username='{stored_name}'\")"
        ),
        sql_example_secure=(
            "# Both Step 1 and Step 2 must be parameterized:\n"
            "db.execute(\"UPDATE profiles SET status='ok' WHERE username=?\", (stored_name,))"
        ),
        ast_explanation=(
            "The stored value is treated as trusted by the second developer, but when concatenated, "
            "it breaks the syntax boundary of the second query."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="UPDATE users SET notes = 'Updated' WHERE username = '{STORED_VALUE}';",
            vulnerable_input="admin' --",
            secure_input="standard_user",
            target_table="users",
            expected_output_vulnerable="The stored payload alters the WHERE clause of the secondary routine, affecting all admin records.",
            expected_output_secure="Only the designated user row is updated.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Compromises downstream background workers, audit scripts, and administrative tools.",
        common_mistakes=[
            "Believing data originating from the internal database is inherently 'safe' and does not need parameterization.",
            "Using input sanitization only at entry and skipping parameterization in internal reporting pipelines.",
        ],
        mitigation_techniques=[
            "Enforce prepared statements for EVERY query in the codebase, even queries operating on internal DB records.",
            "Treat all data originating outside the immediate execution scope as untrusted.",
        ],
    ),
    Lesson(
        id=9,
        slug="database-fingerprinting",
        title="9. Database Fingerprinting & Dialect Analysis",
        category="Reconnaissance",
        difficulty="Intermediate",
        summary="Identifying the specific RDBMS engine (SQLite, MySQL, PostgreSQL, MSSQL) through syntax quirks.",
        explanation=(
            "Different database management systems implement different SQL dialect extensions, comment styles, "
            "string concatenation operators, and built-in functions. Penetration testers determine the exact underlying engine "
            "by sending dialect-specific probes:\n"
            "- String concatenation: `||` in SQLite/PostgreSQL/Oracle, `' '` or `CONCAT()` in MySQL, `+` in MSSQL.\n"
            "- Version functions: `sqlite_version()` in SQLite, `version()` in PostgreSQL/MySQL, `@@version` in MSSQL.\n"
            "- Comments: `-- ` in standard SQL, `#` in MySQL, `/* */` in most engines.\n"
            "- Metadata tables: `sqlite_master` in SQLite, `information_schema.tables` in MySQL/PostgreSQL/MSSQL."
        ),
        sql_example_vulnerable="SELECT sqlite_version() -- SQLite specific dialect probe",
        sql_example_secure="Use DB abstraction layers (SQLAlchemy, Prisma) to maintain safe, dialect-agnostic queries.",
        ast_explanation=(
            "Dialect-specific functions will cause parse errors on mismatched engines and succeed on matching engines."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT sqlite_version();",
            vulnerable_input="sqlite_version()",
            secure_input="SELECT 1",
            target_table="system",
            expected_output_vulnerable="Returns active engine version (e.g. '3.42.0' in SQLite).",
            expected_output_secure="Dialect-neutral generic verification.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Reveals exact database version, patch level, and underlying operating system details.",
        common_mistakes=[
            "Assuming all SQL databases execute identical syntax.",
            "Testing payloads designed for MySQL against SQLite or PostgreSQL and assuming the target is immune when it errors.",
        ],
        mitigation_techniques=[
            "Never expose raw database error banners to clients.",
            "Enforce parameterization to prevent execution of dialect probe functions.",
        ],
    ),
    Lesson(
        id=10,
        slug="sqli-prevention",
        title="10. Comprehensive SQL Injection Prevention",
        category="Defense",
        difficulty="Intermediate",
        summary="A defense-in-depth security architecture: Prepared statements, ORMs, stored procedures, and privilege tiers.",
        explanation=(
            "Preventing SQL injection requires defense-in-depth. Relying on a single perimeter check (like a WAF) is insufficient.\n"
            "Core Pillars of SQLi Prevention:\n"
            "1. Primary Defense: Parameterized Queries (Prepared Statements).\n"
            "2. Secondary Defense: Object-Relational Mapping (ORM) with safe query builders.\n"
            "3. Input Hygiene: Strict type enforcement, allowlisting, and schema validation.\n"
            "4. Operational Defense: Database accounts with minimum necessary permissions (e.g. read-only where applicable).\n"
            "5. Monitoring & Alerting: WAF inspection, audit logging, and automated static code analysis (SAST)."
        ),
        sql_example_vulnerable="# Anti-pattern: String formatting or f-strings\nquery = f\"SELECT * FROM items WHERE name = '{name}'\"",
        sql_example_secure="# Secure pattern: Parameterized query\nquery = \"SELECT * FROM items WHERE name = ?\"\ncursor.execute(query, (name,))",
        ast_explanation=(
            "Defense-in-depth ensures that even if one layer fails, subsequent layers prevent syntax tree mutation."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT * FROM products WHERE name = ?; -- Parameterized template",
            vulnerable_input="' OR '1'='1",
            secure_input="Cyberdeck",
            target_table="products",
            expected_output_vulnerable="When parameterized, the string \"' OR '1'='1\" is searched literally as a name, returning 0 rows safely.",
            expected_output_secure="Finds the item named 'Cyberdeck' without security risks.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Guaranteed immunity from syntax tree hijacking regardless of input contents.",
        common_mistakes=[
            "Using string sanitizers or escape functions (e.g. `addslashes`, `mysql_real_escape_string`) instead of prepared statements.",
            "Granting DBA/root permissions to the web application connection pool.",
        ],
        mitigation_techniques=[
            "Adopt parameterized statements across 100% of queries.",
            "Run automated SAST tools (Semgrep, Bandit, SonarQube) in CI/CD pipelines.",
            "Enforce database user privilege separation.",
        ],
    ),
    Lesson(
        id=11,
        slug="prepared-statements",
        title="11. Prepared Statements: The Mathematical Solution",
        category="Defense",
        difficulty="Intermediate",
        summary="Why parameterization is mathematically immune to SQL injection: Compiling code before binding data.",
        explanation=(
            "Prepared statements (also known as parameterized queries) solve SQL injection at the fundamental language theory level. "
            "They enforce a strict temporal separation between the code and the data:\n\n"
            "1. Preparation Phase (Compile Time): The database server parses the SQL query string with placeholder markers (`?` or `:name`). "
            "The parser builds the Abstract Syntax Tree (AST), performs semantic analysis, and fixes the query structure in memory.\n"
            "2. Execution Phase (Runtime): The application supplies only the parameter values. The database binds these values directly into "
            "the AST data nodes. The parser is NEVER invoked again on this statement!\n\n"
            "Even if the parameter contains `'; DROP TABLE users; --`, the database treats every character as literal scalar text."
        ),
        sql_example_vulnerable="db.execute(f\"SELECT * FROM users WHERE email = '{user_email}'\")",
        sql_example_secure="db.execute(\"SELECT * FROM users WHERE email = :email\", {\"email\": user_email})",
        ast_explanation=(
            "Because the AST is immutable after preparation, input strings cannot spawn new operator or keyword nodes."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT id, username, email FROM users WHERE email = ?; -- Bound parameter",
            vulnerable_input="admin@redcorp.cyber' OR 1=1 --",
            secure_input="admin@redcorp.cyber",
            target_table="users",
            expected_output_vulnerable="Engine searches for literal email address matching \"admin@redcorp.cyber' OR 1=1 --\". Returns empty safely.",
            expected_output_secure="Returns user matching the exact email.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Complete query structure preservation.",
        common_mistakes=[
            "Using a prepared statement API, but concatenating input into the query string before passing it to `prepare()`.",
            "Assuming table names and column names can be parameterized (they cannot; use strict allowlisting for identifiers).",
        ],
        mitigation_techniques=[
            "Use native parameterized query APIs.",
            "Never concatenate variables into SQL strings passed to `prepare()` or `execute()`.",
        ],
    ),
    Lesson(
        id=12,
        slug="input-validation",
        title="12. Input Validation: Allowlisting vs Sanitization",
        category="Defense",
        difficulty="Intermediate",
        summary="Validating dynamic identifiers (table names, column names, sort orders) that cannot be parameterized.",
        explanation=(
            "In SQL, parameter markers (`?` or `$1`) can ONLY replace literal values (strings, numbers, dates). "
            "They CANNOT be used for SQL identifiers such as table names, column names, or sort directions (`ASC`/`DESC`).\n\n"
            "For dynamic sorting or column selection:\n"
            "- DO NOT use blacklists (they are always incomplete).\n"
            "- DO NOT attempt complex regex sanitization.\n"
            "- DO use strict allowlisting: verify that the user's requested column exists in an explicit list of allowed values. "
            "If it does not match, reject the request or default to a safe value."
        ),
        sql_example_vulnerable="f\"SELECT * FROM products ORDER BY {user_sort_column}\"",
        sql_example_secure=(
            "ALLOWED_COLUMNS = {'price': 'price', 'name': 'name', 'stock': 'stock'}\n"
            "sort_col = ALLOWED_COLUMNS.get(user_sort, 'name')\n"
            "query = f\"SELECT * FROM products ORDER BY {sort_col}\" # Safe allowlisted identifier"
        ),
        ast_explanation=(
            "Allowlisting guarantees that only verified alphanumeric identifiers reach the ORDER BY AST branch."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="SELECT name, price, stock FROM products ORDER BY {INPUT};",
            vulnerable_input="price DESC; --",
            secure_input="price",
            target_table="products",
            expected_output_vulnerable="Unchecked input can inject secondary clauses into ORDER BY.",
            expected_output_secure="Safely sorts catalog by price.",
            live_test_api="/api/playground/execute",
        ),
        expected_output="Prevents injection in SQL identifier clauses where prepared statement parameters are unsupported.",
        common_mistakes=[
            "Attempting to bind table or column names via prepared statement parameters (causes database syntax errors).",
            "Trusting dropdown values from client-side forms without server-side validation.",
        ],
        mitigation_techniques=[
            "Maintain an immutable dictionary or set of permitted column and table identifiers.",
            "Reject or fallback to default on invalid identifier values.",
        ],
    ),
    Lesson(
        id=13,
        slug="waf-fundamentals",
        title="13. Web Application Firewall (WAF) Fundamentals",
        category="Defense",
        difficulty="Intermediate",
        summary="How L7 WAFs inspect requests, signature matching, false positives, and why WAFs are not a substitute for secure code.",
        explanation=(
            "A Web Application Firewall (WAF) operates at Layer 7 of the OSI model, inspecting HTTP traffic before it reaches "
            "the web application. WAFs inspect URLs, request headers, cookies, and POST bodies using:\n"
            "1. Signature-based inspection (regex matching known attack patterns like `UNION SELECT`, `' OR 1=1`).\n"
            "2. Protocol anomaly detection (detecting malformed HTTP requests).\n"
            "3. Heuristic / AST-based parsing (tokenizing inputs to evaluate semantic meaning).\n\n"
            "WAF Limitations: Attackers frequently discover bypasses using alternative encodings (URL, hex, Unicode, double encoding), "
            "whitespace substitutes (comments `/**/`, tabs), or unconventional syntax. Furthermore, aggressive WAF rules produce "
            "harmful false positives on innocent user input (like names with apostrophes or searches containing the word 'union'). "
            "A WAF is an auxiliary defensive shield, NEVER a replacement for secure parameterized code."
        ),
        sql_example_vulnerable="Relying solely on WAF without fixing vulnerable concatenation in Python/PHP.",
        sql_example_secure="WAF as Layer 1 shield + Parameterized queries at application layer + Database least privilege.",
        ast_explanation=(
            "The WAF evaluates regex on byte streams. The database engine evaluates full grammar ASTs. "
            "Discrepancies between WAF parsing and DB engine parsing are where bypasses emerge."
        ),
        interactive_demo=LessonInteractiveDemo(
            query_template="WAF Inspection on payload: {INPUT}",
            vulnerable_input="' UNION SELECT 1,2,3 --",
            secure_input="Search for red team accessories",
            target_table="waf_pipeline",
            expected_output_vulnerable="WAF matches RULE-101 and terminates request with HTTP 403 Forbidden.",
            expected_output_secure="WAF identifies benign text, allowing request with HTTP 200 OK.",
            live_test_api="/api/waf/inspect",
        ),
        expected_output="Demonstrates boundary filtering, inspection telemetry, and false-positive risk.",
        common_mistakes=[
            "Assuming a WAF makes code injection vulnerabilities acceptable to leave unpatched.",
            "Tuning WAF rules to maximal paranoia without testing for customer-facing false positives.",
        ],
        mitigation_techniques=[
            "Treat WAF as early warning detection and temporary virtual patching.",
            "Fix root cause vulnerabilities in source code using parameterized queries.",
            "Continually tune WAF rule false-positive thresholds.",
        ],
    ),
]


def get_all_lessons() -> List[Dict[str, Any]]:
    return [
        lesson.model_dump() if hasattr(lesson, "model_dump") else lesson.dict()
        for lesson in LESSONS
    ]


def get_lesson_by_slug(slug: str) -> Dict[str, Any] | None:
    for lesson in LESSONS:
        if lesson.slug == slug:
            return lesson.model_dump() if hasattr(lesson, "model_dump") else lesson.dict()
    return None

