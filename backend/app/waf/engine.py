"""
Simulated Web Application Firewall (WAF) Engine.
Provides isolated, local regex & heuristic inspection, configurable sensitivity,
detailed attack diagnostics, and educational false-positive demonstrations.
Strictly local educational security simulator.
"""

from __future__ import annotations

import re
import urllib.parse
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class WafRule(BaseModel):
    rule_id: str
    name: str
    category: str
    pattern: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    is_enabled: bool = True
    trigger_count: int = 0


class WafInspectionResult(BaseModel):
    verdict: str  # "ALLOWED" | "BLOCKED"
    status_code: int  # 200 | 403
    risk_score: int  # 0 - 100
    matched_rule: Optional[WafRule] = None
    matched_string: Optional[str] = None
    inspected_text: str
    decoded_text: str
    sensitivity_level: str
    explanation: str
    mitigation_tip: str
    timestamp: str
    pipeline_steps: List[str]


class WafLogEntry(BaseModel):
    id: int
    timestamp: str
    verdict: str
    input_sample: str
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    severity: Optional[str] = None
    risk_score: int
    client_ip: str = "127.0.0.1"


class WafEngine:
    """
    Local Educational Web Application Firewall Simulator.
    Simulates modern Layer 7 input inspection pipelines.
    """

    def __init__(self):
        self.sensitivity: str = "MEDIUM"  # LOW | MEDIUM | HIGH | PARANOID
        self.logs: List[WafLogEntry] = []
        self._log_counter = 1
        self.rules: Dict[str, WafRule] = self._default_rules()

    def _default_rules(self) -> Dict[str, WafRule]:
        return {
            "RULE-101": WafRule(
                rule_id="RULE-101",
                name="UNION SELECT Attack Signature",
                category="SQL Keyword",
                pattern=r"(?i)\bUNION\s+(?:ALL\s+)?SELECT\b",
                description="Detects classic UNION injection queries aimed at cross-table data exfiltration.",
                severity="CRITICAL",
                is_enabled=True,
            ),
            "RULE-102": WafRule(
                rule_id="RULE-102",
                name="Tautology / Boolean Bypass (' OR 1=1)",
                category="Boolean Logic",
                pattern=r"(?i)('\s*(?:OR|AND)\s+['\"0-9\w]+\s*=\s*['\"0-9\w]+)|(\bOR\s+1\s*=\s*1\b)",
                description="Catches classic conditional authentication and query bypasses like ' OR 1=1 or ' OR 'a'='a.",
                severity="HIGH",
                is_enabled=True,
            ),
            "RULE-103": WafRule(
                rule_id="RULE-103",
                name="SQL Comment Truncation (--, /*, #)",
                category="Syntax Obfuscation",
                pattern=r"(--|\/\*|\*\/|#)",
                description="Flags trailing comment tokens used to strip remainder of valid backend query clauses.",
                severity="MEDIUM",
                is_enabled=True,
            ),
            "RULE-104": WafRule(
                rule_id="RULE-104",
                name="Time Delay & Benchmark Execution",
                category="Timing Attack",
                pattern=r"(?i)\b(SLEEP|BENCHMARK|PG_SLEEP|WAITFOR\s+DELAY|RANDOMBLOB)\s*\(",
                description="Identifies sleep and heavy computational delay calls used for time-based blind exfiltration.",
                severity="HIGH",
                is_enabled=True,
            ),
            "RULE-105": WafRule(
                rule_id="RULE-105",
                name="Database Metadata & Schema Recon",
                category="Reconnaissance",
                pattern=r"(?i)\b(SQLITE_MASTER|INFORMATION_SCHEMA|SYS\.TABLES|SYSOBJECTS|ALL_TABLES)\b",
                description="Blocks queries attempting to fingerprint database schema catalogs and table structures.",
                severity="HIGH",
                is_enabled=True,
            ),
            "RULE-106": WafRule(
                rule_id="RULE-106",
                name="Stacked Queries & Command Injection",
                category="Execution",
                pattern=r";\s*(?:DROP|ALTER|EXEC|INSERT|UPDATE|DELETE|SHUTDOWN)\b",
                description="Catches semicolon-delimited stacked queries attempting unauthorized DDL or DML.",
                severity="CRITICAL",
                is_enabled=True,
            ),
            "RULE-107": WafRule(
                rule_id="RULE-107",
                name="Strict Single Quote Detection",
                category="Input Character",
                pattern=r"['\"]",
                description="Ultra-strict quotation mark filter. High false positive rate on names (O'Connor) and text.",
                severity="LOW",
                is_enabled=False,
            ),
            "RULE-108": WafRule(
                rule_id="RULE-108",
                name="Hexadecimal / Char Byte Encoding",
                category="Encoding Obfuscation",
                pattern=r"(?i)\b(0x[0-9a-fA-F]+|CHAR\s*\(|CONVERT\s*\()",
                description="Detects hex-encoded byte streams used to bypass ASCII string filters.",
                severity="MEDIUM",
                is_enabled=True,
            ),
        }

    def set_sensitivity(self, level: str) -> str:
        level_upper = level.upper()
        if level_upper in ["LOW", "MEDIUM", "HIGH", "PARANOID"]:
            self.sensitivity = level_upper
            # If paranoid, enable rule 107
            if level_upper == "PARANOID":
                self.rules["RULE-107"].is_enabled = True
            elif self.rules.get("RULE-107"):
                self.rules["RULE-107"].is_enabled = False
        return self.sensitivity

    def toggle_rule(self, rule_id: str, enabled: bool) -> Optional[WafRule]:
        if rule_id in self.rules:
            self.rules[rule_id].is_enabled = enabled
            return self.rules[rule_id]
        return None

    def add_custom_rule(
        self,
        name: str,
        pattern: str,
        category: str = "Custom Rule",
        severity: str = "HIGH",
        description: str = "",
    ) -> WafRule:
        rule_num = len(self.rules) + 101
        rule_id = f"RULE-{rule_num}"
        # Validate regex
        re.compile(pattern)
        new_rule = WafRule(
            rule_id=rule_id,
            name=name,
            category=category,
            pattern=pattern,
            description=description or f"Custom user-defined WAF signature: {name}",
            severity=severity,
            is_enabled=True,
        )
        self.rules[rule_id] = new_rule
        return new_rule

    def reset_rules(self) -> None:
        self.rules = self._default_rules()
        self.sensitivity = "MEDIUM"
        self.logs.clear()

    def inspect_payload(
        self,
        raw_text: str,
        context: str = "query_parameter",
        client_ip: str = "127.0.0.1",
    ) -> WafInspectionResult:
        """
        Executes multi-stage WAF inspection pipeline on the input string.
        """
        pipeline: List[str] = []
        pipeline.append(f"Stage 1 [Ingress]: Received payload via {context}")

        # URL decode
        decoded = urllib.parse.unquote(raw_text)
        pipeline.append(f"Stage 2 [Normalization]: Decoded raw text -> '{decoded[:40]}...'")

        # Map sensitivity to allowed severities
        allowed_severities = {
            "LOW": ["CRITICAL"],
            "MEDIUM": ["CRITICAL", "HIGH"],
            "HIGH": ["CRITICAL", "HIGH", "MEDIUM"],
            "PARANOID": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
        }.get(self.sensitivity, ["CRITICAL", "HIGH"])

        pipeline.append(
            f"Stage 3 [Policy Check]: Sensitivity '{self.sensitivity}' applies to {allowed_severities}"
        )

        matched_rule: Optional[WafRule] = None
        matched_str: Optional[str] = None

        # Inspect enabled rules matching current sensitivity
        for rule in self.rules.values():
            if not rule.is_enabled:
                continue
            if rule.severity not in allowed_severities:
                continue

            try:
                match = re.search(rule.pattern, decoded)
                if match:
                    matched_rule = rule
                    matched_str = match.group(0)
                    rule.trigger_count += 1
                    break
            except Exception:
                continue

        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        if matched_rule:
            pipeline.append(
                f"Stage 4 [Signature Evaluation]: MATCH DETECTED on {matched_rule.rule_id} ('{matched_rule.name}')"
            )
            pipeline.append("Stage 5 [Verdict]: Action -> BLOCK (HTTP 403 Forbidden)")

            score = {
                "CRITICAL": 98,
                "HIGH": 85,
                "MEDIUM": 65,
                "LOW": 40,
            }.get(matched_rule.severity, 75)

            explanation = (
                f"WAF triggered rule {matched_rule.rule_id} ({matched_rule.name}). "
                f"The input matched signature pattern: '{matched_rule.pattern}'. "
                f"Matched segment: '{matched_str}'. Reason: {matched_rule.description}"
            )

            mitigation_tip = (
                "Ensure server-side code uses parameterized statements (prepared statements) "
                "or Object-Relational Mappers (ORMs). Do not rely solely on WAF regex filters, "
                "as attackers frequently discover encoding or syntax evasion bypasses."
            )

            result = WafInspectionResult(
                verdict="BLOCKED",
                status_code=403,
                risk_score=score,
                matched_rule=matched_rule,
                matched_string=matched_str,
                inspected_text=raw_text,
                decoded_text=decoded,
                sensitivity_level=self.sensitivity,
                explanation=explanation,
                mitigation_tip=mitigation_tip,
                timestamp=timestamp,
                pipeline_steps=pipeline,
            )

            self._record_log(result, client_ip)
            return result
        else:
            pipeline.append("Stage 4 [Signature Evaluation]: All active signatures evaluated -> CLEAN")
            pipeline.append("Stage 5 [Verdict]: Action -> ALLOW (HTTP 200 OK)")

            result = WafInspectionResult(
                verdict="ALLOWED",
                status_code=200,
                risk_score=5,
                matched_rule=None,
                matched_string=None,
                inspected_text=raw_text,
                decoded_text=decoded,
                sensitivity_level=self.sensitivity,
                explanation="No active WAF signatures matched the supplied payload under the current sensitivity profile.",
                mitigation_tip="Even if the WAF allows a request, ensure your backend enforces strict parameterized queries to prevent 0-day or obfuscated bypasses.",
                timestamp=timestamp,
                pipeline_steps=pipeline,
            )
            self._record_log(result, client_ip)
            return result

    def _record_log(self, res: WafInspectionResult, client_ip: str):
        entry = WafLogEntry(
            id=self._log_counter,
            timestamp=res.timestamp,
            verdict=res.verdict,
            input_sample=res.inspected_text[:60] + ("..." if len(res.inspected_text) > 60 else ""),
            rule_id=res.matched_rule.rule_id if res.matched_rule else None,
            rule_name=res.matched_rule.name if res.matched_rule else None,
            severity=res.matched_rule.severity if res.matched_rule else None,
            risk_score=res.risk_score,
            client_ip=client_ip,
        )
        self._log_counter += 1
        self.logs.insert(0, entry)
        if len(self.logs) > 100:
            self.logs.pop()


waf_engine = WafEngine()

