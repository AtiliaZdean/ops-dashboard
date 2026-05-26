# routers/tasks.py
# Handles all API routes related to tasks
# This is the core feature of our dashboard

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db
import models

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class TaskCreate(BaseModel):
    # Schema for creating a new task
    title: str
    description: Optional[str] = None        # optional field
    priority: models.TaskPriority = models.TaskPriority.medium  # defaults to medium
    assigned_to: Optional[int] = None        # optional, links to user id
    due_date: Optional[datetime] = None      # optional deadline

class TaskUpdate(BaseModel):
    # Schema for updating a task
    # All fields optional since you might only update one thing
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[models.TaskPriority] = None
    status: Optional[models.TaskStatus] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    # Schema for what we send back
    id: int
    title: str
    description: Optional[str]
    status: models.TaskStatus
    priority: models.TaskPriority
    assigned_to: Optional[int]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@router.get("/", response_model=list[TaskResponse])
def get_all_tasks(
    status: Optional[models.TaskStatus] = None,  # optional filter by status
    priority: Optional[models.TaskPriority] = None,  # optional filter by priority
    assigned_to: Optional[int] = None,           # optional filter by user
    db: Session = Depends(get_db)
):
    # GET /tasks
    # Returns all tasks, with optional filters
    # e.g. GET /tasks?status=pending&priority=high
    query = db.query(models.Task)

    # Apply filters only if they were provided
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if assigned_to:
        query = query.filter(models.Task.assigned_to == assigned_to)

    return query.all()


@router.get("/stats")
def get_task_stats(db: Session = Depends(get_db)):
    # GET /tasks/stats
    # Returns summary numbers for the dashboard overview
    total = db.query(models.Task).count()

    # Count each status separately
    pending = db.query(models.Task).filter(models.Task.status == models.TaskStatus.pending).count()
    in_progress = db.query(models.Task).filter(models.Task.status == models.TaskStatus.in_progress).count()
    completed = db.query(models.Task).filter(models.Task.status == models.TaskStatus.completed).count()
    overdue = db.query(models.Task).filter(models.Task.status == models.TaskStatus.overdue).count()

    # Calculate completion rate, avoid division by zero
    completion_rate = round((completed / total) * 100, 2) if total > 0 else 0

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "overdue": overdue,
        "completion_rate": completion_rate  # percentage
    }


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    # GET /tasks/{id}
    # Returns a single task by ID
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # POST /tasks
    # Creates a new task
    # If assigned_to is provided, verify the user exists
    if task.assigned_to:
        user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
        if not user:
            raise HTTPException(status_code=404, detail="Assigned user not found")

    new_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        assigned_to=task.assigned_to,
        due_date=task.due_date
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Log this action
    log = models.AuditLog(
        action="task_created",
        detail=f"Task '{task.title}' was created with priority '{task.priority}'",
        task_id=new_task.id,
        user_id=task.assigned_to
    )
    db.add(log)
    db.commit()

    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    # PUT /tasks/{id}
    # Updates a task - only updates fields that were provided
    existing = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")

    # Track what changed for the audit log
    changes = []

    # Only update fields that were actually sent
    if task.title is not None:
        changes.append(f"title changed to '{task.title}'")
        existing.title = task.title
    if task.description is not None:
        existing.description = task.description
    if task.priority is not None:
        changes.append(f"priority changed to '{task.priority}'")
        existing.priority = task.priority
    if task.status is not None:
        changes.append(f"status changed to '{task.status}'")
        existing.status = task.status
    if task.assigned_to is not None:
        changes.append(f"assigned to user id '{task.assigned_to}'")
        existing.assigned_to = task.assigned_to
    if task.due_date is not None:
        existing.due_date = task.due_date

    db.commit()
    db.refresh(existing)

    # Log with details of what changed
    log = models.AuditLog(
        action="task_updated",
        detail=f"Task '{existing.title}' updated: {', '.join(changes)}",
        task_id=task_id
    )
    db.add(log)
    db.commit()

    return existing


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    # DELETE /tasks/{id}
    # Deletes a task
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    log = models.AuditLog(
        action="task_deleted",
        detail=f"Task '{task.title}' was deleted",
        task_id=task_id
    )
    db.add(log)
    db.commit()

    db.delete(task)
    db.commit()

    return {"message": f"Task '{task.title}' deleted successfully"}