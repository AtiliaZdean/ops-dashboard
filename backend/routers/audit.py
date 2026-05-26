# routers/audit.py
# Handles all API routes related to audit logs
# This is a read-only router - audit logs should never be
# manually created, edited or deleted via API
# They are only created automatically by other routes

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db
import models

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"]
)

# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class AuditLogResponse(BaseModel):
    # Schema for what we send back
    id: int
    action: str
    detail: Optional[str]
    user_id: Optional[int]
    task_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@router.get("/", response_model=list[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,       # filter by action type e.g. "task_created"
    user_id: Optional[int] = None,      # filter by who did it
    task_id: Optional[int] = None,      # filter by which task
    limit: int = 50,                    # how many records to return, default 50
    db: Session = Depends(get_db)
):
    # GET /audit
    # Returns audit logs, newest first
    # Supports optional filters
    query = db.query(models.AuditLog)

    # Apply filters only if provided
    if action:
        query = query.filter(models.AuditLog.action == action)
    if user_id:
        query = query.filter(models.AuditLog.user_id == user_id)
    if task_id:
        query = query.filter(models.AuditLog.task_id == task_id)

    # Order by newest first, limit results
    logs = query.order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
    return logs


@router.get("/summary")
def get_audit_summary(db: Session = Depends(get_db)):
    # GET /audit/summary
    # Returns a count of each action type
    # Useful for the dashboard to show activity overview
    from sqlalchemy import func

    # Group by action and count occurrences
    results = (
        db.query(models.AuditLog.action, func.count(models.AuditLog.id).label("count"))
        .group_by(models.AuditLog.action)
        .all()
    )

    # Format into a clean dictionary
    # e.g. {"task_created": 5, "user_deleted": 1}
    summary = {row.action: row.count for row in results}
    return summary
