 # routers/users.py
# This file handles all API routes related to users
# Routes are like URLs that the frontend can call to get or send data

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Import our database connection and models
from database import get_db
import models

# ─────────────────────────────────────────
# ROUTER
# Instead of putting all routes in main.py,
# we separate them into routers for cleanliness
# ─────────────────────────────────────────

router = APIRouter(
    prefix="/users",    # all routes here start with /users
    tags=["Users"]      # groups them together in /docs
)

# ─────────────────────────────────────────
# SCHEMAS (Pydantic Models)
# These define what data shape we expect to
# receive and what we send back
# Think of them as validation rules
# ─────────────────────────────────────────

class UserCreate(BaseModel):
    # Schema for creating a new user
    # These fields are required in the request body
    name: str
    email: str
    role: str

class UserResponse(BaseModel):
    # Schema for what we send back to the frontend
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # allows SQLAlchemy objects to be serialized

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@router.get("/", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    # GET /users
    # Returns all users in the database
    users = db.query(models.User).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # GET /users/{id}
    # Returns a single user by ID
    user = db.query(models.User).filter(models.User.id == user_id).first()

    # If user not found, return 404 error
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # POST /users
    # Creates a new user
    # First check if email already exists
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user object
    new_user = models.User(
        name=user.name,
        email=user.email,
        role=user.role
    )

    db.add(new_user)        # stage the insert
    db.commit()             # save to database
    db.refresh(new_user)    # get the updated object back (with id, created_at etc)

    # Log this action in audit_logs
    log = models.AuditLog(
        action="user_created",
        detail=f"New user '{user.name}' with role '{user.role}' was created",
        user_id=new_user.id
    )
    db.add(log)
    db.commit()

    return new_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    # PUT /users/{id}
    # Updates an existing user
    existing = db.query(models.User).filter(models.User.id == user_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    existing.name = user.name
    existing.email = user.email
    existing.role = user.role

    db.commit()
    db.refresh(existing)

    # Log this action
    log = models.AuditLog(
        action="user_updated",
        detail=f"User '{user.name}' details were updated",
        user_id=user_id
    )
    db.add(log)
    db.commit()

    return existing


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # DELETE /users/{id}
    # Deletes a user by ID
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Log before deleting so we still have the name
    log = models.AuditLog(
        action="user_deleted",
        detail=f"User '{user.name}' was deleted from the system",
    )
    db.add(log)
    db.commit()

    db.delete(user)
    db.commit()

    return {"message": f"User '{user.name}' deleted successfully"}
