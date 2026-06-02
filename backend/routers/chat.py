# handles the AI chat feature
# user asks a question in natural language
# fetch relevant data from the database
# then send everything to groq AI to answer

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

from database import get_db
import models

load_dotenv()

# Configure Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from pydantic import BaseModel
# from google import genai
# import os
# from dotenv import load_dotenv

# from database import get_db
# import models

# load_dotenv()

# # Configure Gemini client with our API key
# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
# # client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

router = APIRouter(
    prefix = "/chat",
    tags = ["AI Chat"]
)

# ---
# SCHEMA
# ---

class ChatRequest(BaseModel):
    message: str  # the user's question

# ---
# HELPER - BUILD DATABASE CONTEXT
# this is the key function that makes the AI smart
# fetch real data from PostgreSQL and pass it to groq so it can answer questions accurately
# ---

def get_database_context(db: Session) -> str:
    # fetch all users
    users = db.query(models.User).all()
    users_text = "\n".join([
        f"- ID:{u.id} Name:{u.name} Email:{u.email} Role:{u.role}"
        for u in users
    ])

    # fetch all tasks
    tasks = db.query(models.Task).all()
    tasks_text = "\n".join([
        f"- ID:{t.id} Title:{t.title} Status:{t.status.value} Priority:{t.priority.value} AssignedTo:{t.assigned_to} DueDate:{t.due_date}"
        for t in tasks
    ])

    # fetch task stats
    total = db.query(models.Task).count()
    completed = db.query(models.Task).filter(models.Task.status == models.TaskStatus.completed).count()
    pending = db.query(models.Task).filter(models.Task.status == models.TaskStatus.pending).count()
    overdue = db.query(models.Task).filter(models.Task.status == models.TaskStatus.overdue).count()
    in_progress = db.query(models.Task).filter(models.Task.status == models.TaskStatus.in_progress).count()

    # fetch recent audit logs
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(20).all()
    logs_text = "\n".join([
        f"- {l.timestamp}: {l.action} - {l.detail}"
        for l in logs
    ])

    # build the full context string
    # this gets sent to groq alongside the user's question
    context = f"""
        You are an AI assistant for an internal operations dashboard.
        Answer questions based ONLY on the data provided below.
        Be concise and helpful. If the data doesn't contain the answer, say so.

        === USERS ({len(users)} total) ===
        {users_text or "No users found"}

        === TASKS ({total} total) ===
        Status Summary: {completed} completed, {pending} pending, {in_progress} in progress, {overdue} overdue
        {tasks_text or "No tasks found"}

        === RECENT ACTIVITY (last 20 logs) ===
        {logs_text or "No activity yet"}
    """
    return context


# ---
# CHAT ROUTE
# ---

@router.post("/")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get fresh data from database
        context = get_database_context(db)

        # # Build the full prompt for Gemini
        # prompt = f"{context}\n\nUser question: {request.message}"

        # Send to Gemini and get response
        # response = client.models.generate_content(
        #     model="gemini-1.5-flash",
        #     contents=prompt
        # )

        # return {"reply": response.text}

        # Send to Groq
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # fast free model
            messages=[
                {"role": "system", "content": context},
                {"role": "user",   "content": request.message}
            ]
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise
