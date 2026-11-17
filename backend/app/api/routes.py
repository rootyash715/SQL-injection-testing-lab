"""
Core API routes for the SQL Injection Learning Lab.
Provides endpoints for Dashboard, Modules, Playground, WAF Lab, Flag Verification, and DB Reset.
"""

from __future__ import annotations

import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db, reset_database, get_raw_connection
from app.models.models import ChallengeProgress, User, Product, Employee, SecretCredential
from app.waf.engine import waf_engine, WafInspectionResult, WafRule
from app.modules.curriculum import get_all_lessons, get_lesson_by_slug
from app.playground.executor import (
    execute_playground_query,
    PlaygroundExecuteRequest,
    PlaygroundExecuteResponse,
    EDUCATIONAL_PAYLOADS,
)

router = APIRouter()


# -----------------------------------------------------------------------------
# DASHBOARD
# -----------------------------------------------------------------------------
class DashboardStats(BaseModel):
    total_lessons: int
    completed_challenges: int
    total_challenges: int
    current_level: str
    learning_progress_pct: float
    active_lab_instances: int
    total_lab_instances: int
    waf_status: str
    waf_sensitivity: str
    waf_active_rules: int
    waf_blocked_count: int
    recent_testing_history: List[Dict[str, Any]]
    system_health: str


def _calculate_rank(completed: int) -> str:
    ranks = [
        (0, "LVL 1 // RECON OPERATOR"),
        (1, "LVL 2 // SCRIPT ANALYST"),
        (2, "LVL 3 // PAYLOAD TESTER"),
        (3, "LVL 4 // EXPLOIT ANALYST"),
        (4, "LVL 5 // APPLSEC SPECIALIST"),
        (5, "LVL 6 // RED TEAM OPERATIVE"),
        (6, "LVL 7 // ZERO-DAY RESEARCHER"),
        (7, "LVL 8 // CYBER GHOST MASTER"),
    ]
    rank_name = "LVL 1 // RECON OPERATOR"
    for count, name in ranks:
        if completed >= count:
            rank_name = name
    return rank_name


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    challenges = db.query(ChallengeProgress).all()
    total_challenges = len(challenges) or 7
    completed_count = sum(1 for c in challenges if c.completed)
    progress_pct = round((completed_count / total_challenges) * 100, 1) if total_challenges else 0.0

    active_waf_rules = sum(1 for r in waf_engine.rules.values() if r.is_enabled)
    blocked_count = sum(1 for log in waf_engine.logs if log.verdict == "BLOCKED")

    recent_history = [
        log.model_dump() if hasattr(log, "model_dump") else log.dict()
        for log in waf_engine.logs[:10]
    ]

    return DashboardStats(
        total_lessons=13,
        completed_challenges=completed_count,
        total_challenges=total_challenges,
        current_level=_calculate_rank(completed_count),
        learning_progress_pct=progress_pct,
        active_lab_instances=7,
        total_lab_instances=7,
        waf_status="SHIELD_ACTIVE",
        waf_sensitivity=waf_engine.sensitivity,
        waf_active_rules=active_waf_rules,
        waf_blocked_count=blocked_count,
        recent_testing_history=recent_history,
        system_health="ONLINE (127.0.0.1 ISOLATED)",
    )


# -----------------------------------------------------------------------------
# CHALLENGES & FLAGS
# -----------------------------------------------------------------------------
class FlagSubmissionRequest(BaseModel):
    lab_id: str
    flag: str


class FlagSubmissionResponse(BaseModel):
    success: bool
    message: str
    lab_id: str
    completed_count: int
    rank: str


@router.post("/challenges/submit-flag", response_model=FlagSubmissionResponse)
def submit_flag(submission: FlagSubmissionRequest, db: Session = Depends(get_db)):
    record = db.query(ChallengeProgress).filter(ChallengeProgress.lab_id == submission.lab_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab record not found.")

    record.attempts += 1

    if submission.flag.strip() == record.flag.strip():
        record.completed = True
        record.completed_at = datetime.now(timezone.utc)
        db.commit()

        total_completed = db.query(ChallengeProgress).filter(ChallengeProgress.completed == True).count()
        return FlagSubmissionResponse(
            success=True,
            message="FLAG ACCEPTED! Challenge marked as completed.",
            lab_id=submission.lab_id,
            completed_count=total_completed,
            rank=_calculate_rank(total_completed),
        )
    else:
        db.commit()
        return FlagSubmissionResponse(
            success=False,
            message="INVALID FLAG: Ensure you extract the exact flag string from the lab objective.",
            lab_id=submission.lab_id,
            completed_count=db.query(ChallengeProgress).filter(ChallengeProgress.completed == True).count(),
            rank=_calculate_rank(0),
        )


@router.get("/challenges/list")
def list_challenges(db: Session = Depends(get_db)):
    return db.query(ChallengeProgress).all()


# -----------------------------------------------------------------------------
# CURRICULUM MODULES
# -----------------------------------------------------------------------------
@router.get("/modules")
def list_modules():
    return get_all_lessons()


@router.get("/modules/{slug}")
def get_module(slug: str):
    lesson = get_lesson_by_slug(slug)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


# -----------------------------------------------------------------------------
# PAYLOAD PLAYGROUND
# -----------------------------------------------------------------------------
@router.post("/playground/execute", response_model=PlaygroundExecuteResponse)
def run_playground_query(req: PlaygroundExecuteRequest):
    return execute_playground_query(req)


@router.get("/playground/payloads")
def list_playground_payloads():
    return EDUCATIONAL_PAYLOADS


# -----------------------------------------------------------------------------
# SIMULATED WAF
# -----------------------------------------------------------------------------
class WafSensitivityRequest(BaseModel):
    sensitivity: str


class WafToggleRuleRequest(BaseModel):
    rule_id: str
    is_enabled: bool


class WafCustomRuleRequest(BaseModel):
    name: str
    pattern: str
    category: str = "Custom Rule"
    severity: str = "HIGH"
    description: str = ""


class WafInspectRequest(BaseModel):
    payload: str
    context: str = "query_parameter"


@router.get("/waf/rules")
def get_waf_rules():
    return list(waf_engine.rules.values())


@router.post("/waf/rules/toggle")
def toggle_waf_rule(req: WafToggleRuleRequest):
    rule = waf_engine.toggle_rule(req.rule_id, req.is_enabled)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule ID not found")
    return rule


@router.post("/waf/sensitivity")
def update_waf_sensitivity(req: WafSensitivityRequest):
    new_sens = waf_engine.set_sensitivity(req.sensitivity)
    return {"sensitivity": new_sens}


@router.post("/waf/rules/custom")
def add_custom_waf_rule(req: WafCustomRuleRequest):
    try:
        new_rule = waf_engine.add_custom_rule(
            name=req.name,
            pattern=req.pattern,
            category=req.category,
            severity=req.severity,
            description=req.description,
        )
        return new_rule
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid regex pattern: {str(e)}")


@router.post("/waf/inspect", response_model=WafInspectionResult)
def inspect_waf_payload(req: WafInspectRequest):
    return waf_engine.inspect_payload(req.payload, context=req.context)


@router.get("/waf/logs")
def get_waf_logs():
    return waf_engine.logs


@router.post("/waf/logs/clear")
def clear_waf_logs():
    waf_engine.logs.clear()
    return {"status": "cleared"}


@router.post("/waf/reset")
def reset_waf():
    waf_engine.reset_rules()
    return {"status": "WAF rules and state restored to default."}


# -----------------------------------------------------------------------------
# DATABASE MANAGEMENT & RESET
# -----------------------------------------------------------------------------
@router.post("/system/reset-database")
def trigger_database_reset():
    """
    Wipes and restores the database with clean fictional training records.
    """
    reset_database()
    return {
        "status": "success",
        "message": "Database and fictional lab records have been successfully reset to initial factory state.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

