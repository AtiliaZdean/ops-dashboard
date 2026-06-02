# This is the entry point of our FastAPI backend
# Every API route (endpoint) will be registered here

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our database connection and models
from database import engine, Base
import models  # noqa: F401 - needed so SQLAlchemy sees all models before creating tables

# Import routers - each file handles a different feature
from routers import users, tasks, audit, chat

# ─────────────────────────────────────────
# CREATE FASTAPI APP
# ─────────────────────────────────────────

app = FastAPI(
    title="Ops Dashboard API",       # shows up in auto-generated docs
    description="Internal operations dashboard backend",
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS MIDDLEWARE
# This allows our React frontend (running on a different port)
# to talk to this FastAPI backend without being blocked by the browser
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server default port
    allow_credentials=True,
    allow_methods=["*"],    # allow GET, POST, PUT, DELETE etc
    allow_headers=["*"],    # allow all headers
)

# ─────────────────────────────────────────
# CREATE TABLES
# This runs when the app starts
# SQLAlchemy will look at our models and create the tables
# in PostgreSQL if they don't exist yet
# ─────────────────────────────────────────

# Register routers with the app
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(audit.router)
app.include_router(chat.router)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────
# ROOT ROUTE
# Just a health check so we know the API is running
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Ops Dashboard API is running!"}
