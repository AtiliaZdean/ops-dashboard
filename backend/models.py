 # models.py
# This file defines all our database tables as Python classes
# SQLAlchemy will translate these classes into actual PostgreSQL tables

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# Import Base from database.py - all models must inherit from this
from database import Base

# ─────────────────────────────────────────
# ENUM TYPES
# These are fixed value options, like a dropdown
# ─────────────────────────────────────────

class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    overdue = "overdue"

class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

# ─────────────────────────────────────────
# USER TABLE
# Represents staff/workers in the system
# ─────────────────────────────────────────

class User(Base):
    __tablename__ = "users"  # actual table name in PostgreSQL

    id = Column(Integer, primary_key=True, index=True)  # auto increment ID
    name = Column(String(100), nullable=False)           # full name
    email = Column(String(100), unique=True, nullable=False)  # must be unique
    role = Column(String(50), nullable=False)            # e.g. manager, worker
    created_at = Column(DateTime, server_default=func.now())  # auto timestamp

    # One user can have many tasks assigned to them
    tasks = relationship("Task", back_populates="assignee")

    # One user can generate many audit logs
    audit_logs = relationship("AuditLog", back_populates="user")


# ─────────────────────────────────────────
# TASK TABLE
# Represents work items/jobs in the system
# ─────────────────────────────────────────

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)           # short task name
    description = Column(Text, nullable=True)             # longer details
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)      # current state
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium) # urgency level
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True) # links to users table
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    due_date = Column(DateTime, nullable=True)            # optional deadline

    # This gives us access to the User object assigned to this task
    assignee = relationship("User", back_populates="tasks")

    # One task can have many audit logs (e.g. status changes)
    audit_logs = relationship("AuditLog", back_populates="task")


# ─────────────────────────────────────────
# AUDIT LOG TABLE
# Tracks every important action in the system
# This is your database management specialty!
# ─────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)   # e.g. "task_created", "status_changed"
    detail = Column(Text, nullable=True)           # extra info about what changed
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # who did it
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)  # which task
    timestamp = Column(DateTime, server_default=func.now())           # when it happened

    # Relationships back to User and Task
    user = relationship("User", back_populates="audit_logs")
    task = relationship("Task", back_populates="audit_logs")

# One user can have many tasks
# One task can have many audit log entries
# One user can generate many audit log entries
