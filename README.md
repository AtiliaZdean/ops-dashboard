# Ops Dashboard
![CI](https://github.com/AtiliaZdean/ops-dashboard/actions/workflows/ci.yml/badge.svg)

An AI-powered internal operations dashboard for managing tasks, staff, and business insights.

![Dashboard Preview](preview/Dashboard.png)
![Tasks Preview](preview/Tasks.png)
![Users Preview](preview/Users.png)
![Audit Logs Preview](preview/AuditLogs.png)
![AI Chat Preview](preview/AIChat.png)

---

## Features

- **Dashboard Overview** — live stats including task completion rate, pending tasks, and user count with charts
- **Task Management** — create, assign, update, and delete tasks with priority and status tracking
- **User Management** — manage staff with role-based assignments (admin, manager, worker)
- **Audit Log System** — every create, update, and delete action is automatically tracked for full traceability
- **AI Assistant** — natural language chatbot powered by Groq (LLaMA 3) that queries your live database
  - *"How many tasks are pending?"*
  - *"Who are the current users?"*
  - *"Show me a summary of all activity"*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Recharts |
| Backend | FastAPI (Python) |
| Database | PostgreSQL 18 |
| AI | Groq API (LLaMA 3.1 8B) |
| Containerization | Docker + Docker Compose |
| Version Control | Git + GitHub |

---

## Architecture

```
React Frontend (port 3000)
        |
        | HTTP
        v
FastAPI Backend (port 8000)
        |
        |-- SQL --> PostgreSQL DB (port 5432)
        |
        |-- API call --> Groq API (LLaMA 3.1 8B)
```

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Groq API Key](https://console.groq.com) (free)

### Installation

1. Clone the repository
```bash
   git clone https://github.com/AtiliaZdean/ops-dashboard.git
   cd ops-dashboard
```

2. Create a `.env` file in the project root
```bash
   cp backend/.env.example .env
```
   Then edit `.env` and add your Groq API key:
GROQ_API_KEY=your_groq_api_key_here

3. Start the application
```bash
   docker-compose up --build
```

4. Open your browser
   - **Dashboard** → http://localhost:3000
   - **API Docs** → http://localhost:8000/docs

---

## Database Schema

**users** — id (PK), name, email (unique), role, created_at

**tasks** — id (PK), title, description, status, priority, assigned_to (FK), due_date, created_at, updated_at

**audit_logs** — id (PK), action, detail, user_id (FK), task_id (FK), timestamp

Relationships: one user has many tasks, one task has many audit logs.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/` | Get all users |
| POST | `/users/` | Create user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| GET | `/tasks/` | Get all tasks (supports filters) |
| GET | `/tasks/stats` | Get task statistics |
| POST | `/tasks/` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/audit/` | Get audit logs |
| GET | `/audit/summary` | Get activity summary |
| POST | `/chat/` | AI chat query |

---

## Project Structure

```
ops-dashboard/
  backend/
    routers/
      users.py        - User CRUD endpoints
      tasks.py        - Task CRUD endpoints
      audit.py        - Audit log endpoints
      chat.py         - AI chat endpoint
    database.py       - PostgreSQL connection
    models.py         - SQLAlchemy table definitions
    main.py           - FastAPI app entry point
    requirements.txt
    Dockerfile
  frontend/
    src/
      api/            - Axios API client
      components/     - Sidebar, Topbar
      pages/          - Dashboard, Tasks, Users, AuditLogs, AIChat
    Dockerfile
    package.json
  docker-compose.yml
  README.md
```

---

## Key Design Decisions

**Why FastAPI?** FastAPI's automatic OpenAPI documentation (`/docs`) makes API testing and demonstration straightforward, and its Python foundation integrates naturally with AI/ML libraries.

**Why PostgreSQL?** As a database management graduate, PostgreSQL was the natural choice for its robustness, support for custom ENUM types, and production-grade reliability.

**Why Groq instead of other AI providers?** Groq offers a genuinely free tier with fast inference speeds, making it ideal for a portfolio project that needs reliable AI functionality without cost concerns.

**Why an audit log system?** Full traceability is a database management best practice. Every state change in the system is recorded with timestamps, enabling accountability and debugging.

---

## Future Improvements

These are intentionally out of scope for this portfolio project but would be required for a production deployment:

- **Authentication & Authorization** — JWT-based login system with role-based access control (managers vs workers see different views)
- **Advanced AI** — upgrade to a larger model, add conversation memory, and support more complex analytical queries like trend detection across time periods
- **Real-time Updates** — WebSocket integration so the dashboard refreshes live without manual page reload
- **Data Export** — export tasks and audit logs to CSV or PDF for reporting
- **Unit & Integration Tests** — pytest for backend endpoints, React Testing Library for frontend components
- **CI/CD Pipeline** — GitHub Actions workflow to run tests and auto-deploy on every push
- **Rate Limiting** — protect the AI chat endpoint from abuse
- **Pagination** — handle large datasets properly instead of fetching all records at once

---

## Author

**Atilia Zainuddin**
- GitHub: [@AtiliaZdean](https://github.com/AtiliaZdean)
