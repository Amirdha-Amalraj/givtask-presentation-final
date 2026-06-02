# GivTask Backend API

A Flask + SQLite REST API that powers the GivTask platform — connecting NGOs with skilled volunteers and freelancers.

---

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Language    | Python 3.10+                  |
| Framework   | Flask 3.0                     |
| Database    | SQLite (via Flask-SQLAlchemy) |
| Auth        | Password hashing (Werkzeug)   |
| CORS        | Flask-CORS                    |

---

## Project Structure

```
backend/
├── app.py                  # Application factory + entry point
├── config.py               # Configuration (DB path, secret key)
├── requirements.txt        # Python dependencies
├── seed_demo.py            # Demo data seeder
│
├── database/
│   └── givtask.db          # SQLite database (auto-created on first run)
│
├── models/
│   ├── __init__.py         # SQLAlchemy db instance
│   ├── user.py             # User model (volunteer/freelancer/ngo/admin)
│   ├── task.py             # Task model
│   └── application.py      # Application model
│
├── routes/
│   ├── __init__.py
│   ├── auth.py             # /api/register, /api/login
│   ├── tasks.py            # /api/tasks (CRUD)
│   └── applications.py     # /api/applications
│
├── services/
│   └── validation.py       # Input validation helpers
│
└── utils/
    └── helpers.py          # Standard success/error response builders
```

---

## Installation

### 1. Clone / navigate to the backend folder

```bash
cd givtask-backend
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the backend

```bash
python app.py
```

The server starts at **http://localhost:5000**

The SQLite database (`database/givtask.db`) and tables are created automatically on first run. A default admin account is also seeded.

### 5. Seed demo data (optional but recommended for demos)

```bash
python seed_demo.py
```

This creates demo NGOs, volunteers, freelancers, tasks, and sample applications.

---

## Demo Accounts

All demo accounts use password: **demo1234**

| Role       | Email                    | Password  |
|------------|--------------------------|-----------|
| NGO        | ngo@edureach.com         | demo1234  |
| NGO        | ngo@greenearth.com       | demo1234  |
| Volunteer  | volunteer@demo.com       | demo1234  |
| Freelancer | freelancer@demo.com      | demo1234  |
| Admin      | admin@givtask.com        | admin123  |

---

## API Reference

All responses follow this structure:

**Success**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error**
```json
{ "success": false, "message": "Error description" }
```

---

### AUTH

#### POST `/api/register`

Register a new user.

**Request body:**
```json
{
  "full_name": "Arjun Mehta",
  "email":     "arjun@example.com",
  "password":  "mypassword",
  "role":      "volunteer",
  "city":      "Pune",
  "state":     "Maharashtra"
}
```

`role` must be one of: `volunteer`, `freelancer`, `ngo`, `admin`

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "id": 5,
    "full_name": "Arjun Mehta",
    "email": "arjun@example.com",
    "role": "volunteer",
    "city": "Pune",
    "state": "Maharashtra",
    "created_at": "2024-06-01T10:00:00"
  }
}
```

---

#### POST `/api/login`

**Request body:**
```json
{
  "email":    "ngo@edureach.com",
  "password": "demo1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "id":        2,
    "full_name": "EduReach Foundation",
    "email":     "ngo@edureach.com",
    "role":      "ngo"
  }
}
```

---

### TASKS

#### GET `/api/tasks`

List all tasks. Supports query filters:

| Param       | Type   | Example                  |
|-------------|--------|--------------------------|
| `search`    | string | `?search=design`         |
| `task_type` | string | `?task_type=volunteer`   |
| `work_mode` | string | `?work_mode=remote`      |
| `category`  | string | `?category=Web`          |
| `ngo_id`    | int    | `?ngo_id=2`              |

**Response (200):** Array of task objects.

---

#### GET `/api/tasks/<id>`

Get a single task by ID.

---

#### POST `/api/tasks`

Create a task. Only NGO users can create tasks.

**Request body:**
```json
{
  "ngo_id":          2,
  "title":           "Build Donor Portal",
  "description":     "Full-stack web app for donor management...",
  "category":        "Web Development",
  "required_skills": ["React", "Node.js"],
  "work_mode":       "remote",
  "task_type":       "paid"
}
```

`required_skills` can be a list or comma-separated string.
`work_mode`: `remote` | `onsite` | `hybrid`
`task_type`: `volunteer` | `paid`

**Response (201):** Created task object.

---

#### PUT `/api/tasks/<id>`

Update a task. Pass `ngo_id` to verify ownership.

**Request body:** Any subset of task fields + `ngo_id`.

---

#### DELETE `/api/tasks/<id>`

Delete a task and all its applications (cascade).

**Request body:** `{ "ngo_id": 2 }` to verify ownership.

---

### APPLICATIONS

#### POST `/api/applications`

Submit an application. Only `volunteer` and `freelancer` roles can apply.

**Request body:**
```json
{
  "task_id":      3,
  "applicant_id": 4
}
```

Returns `409` if the user has already applied.

---

#### GET `/api/applications/task/<task_id>`

Get all applicants for a specific task (NGO view).

**Response:** Array of application objects, each including full applicant details.

---

#### GET `/api/applications/user/<user_id>`

Get all applications submitted by a user (volunteer/freelancer view).

**Response:** Array of application objects, each including full task details.

---

#### PATCH `/api/applications/<id>/status`

Update application status (NGO action).

**Request body:**
```json
{
  "status": "shortlisted",
  "ngo_id": 2
}
```

`status` must be: `pending` | `shortlisted` | `accepted` | `rejected`

---

### HEALTH

#### GET `/api/health`

```json
{ "status": "ok", "message": "GivTask API is running." }
```

---

## Demo Flow (End-to-End)

This is the full 10-step demonstration workflow:

```
Step 1  — POST /api/register        (register NGO)
Step 2  — POST /api/login           (login NGO → get ngo_id)
Step 3  — POST /api/tasks           (NGO creates task using ngo_id)
Step 4  — GET  /api/tasks/<id>      (verify task saved in DB)
Step 5  — POST /api/register        (register Volunteer)
Step 6  — POST /api/login           (login Volunteer → get applicant_id)
Step 7  — GET  /api/tasks           (Volunteer browses tasks)
Step 8  — POST /api/applications    (Volunteer applies using task_id + applicant_id)
Step 9  — POST /api/login           (login NGO again)
Step 10 — GET  /api/applications/task/<task_id>   (NGO views applicants)
Step 11 — PATCH /api/applications/<id>/status     (NGO shortlists applicant)
```

---

## Postman Testing Guide

### Setup

1. Open Postman and create a new Collection named **GivTask API**
2. Set a base URL variable: `base_url = http://localhost:5000`
3. Start the Flask server: `python app.py`

### Environment Variables (set after each login)

After a successful login, copy the `id` from the response and store it:
- `ngo_id` — from NGO login
- `volunteer_id` — from Volunteer login
- `task_id` — from task creation
- `app_id` — from application creation

### Request Headers

For all POST/PUT/PATCH requests set:
```
Content-Type: application/json
```

### Test Sequence

**1. Health check**
```
GET {{base_url}}/api/health
```

**2. Login as NGO**
```
POST {{base_url}}/api/login
Body: { "email": "ngo@edureach.com", "password": "demo1234" }
→ Save response data.id as ngo_id
```

**3. Create a task**
```
POST {{base_url}}/api/tasks
Body: {
  "ngo_id": {{ngo_id}},
  "title": "Demo Task",
  "description": "This is a Postman demo task for testing.",
  "category": "Web Development",
  "required_skills": "React, Node.js",
  "work_mode": "remote",
  "task_type": "volunteer"
}
→ Save response data.id as task_id
```

**4. View all tasks**
```
GET {{base_url}}/api/tasks
```

**5. Login as Volunteer**
```
POST {{base_url}}/api/login
Body: { "email": "volunteer@demo.com", "password": "demo1234" }
→ Save response data.id as volunteer_id
```

**6. Apply to task**
```
POST {{base_url}}/api/applications
Body: { "task_id": {{task_id}}, "applicant_id": {{volunteer_id}} }
→ Save response data.id as app_id
```

**7. View applicants (NGO)**
```
GET {{base_url}}/api/applications/task/{{task_id}}
```

**8. Shortlist applicant**
```
PATCH {{base_url}}/api/applications/{{app_id}}/status
Body: { "status": "shortlisted", "ngo_id": {{ngo_id}} }
```

**9. View volunteer's applications**
```
GET {{base_url}}/api/applications/user/{{volunteer_id}}
```

---

## Connecting to the React Frontend

The React frontend (GivTask) makes API calls to `http://localhost:5000`.

To update the base URL in the frontend, find the API calls in the React source and replace the base URL if needed. CORS is fully open, so no additional configuration is required.

---

## Notes

- This is a development server. Do not use in production.
- SQLite is used for simplicity — suitable for demos and academic projects.
- No JWT or session tokens are used. The frontend stores the user ID and role in React state.
- To reset the database: delete `database/givtask.db` and restart the server, then re-run `seed_demo.py`.

---

## Deployment — Render

### Steps
1. Push `givtask-backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command:** `pip install -r requirements.txt && python seed_demo.py`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2`
4. Add environment variables:
   - `SECRET_KEY` = any random string
   - `CORS_ORIGINS` = your Vercel frontend URL (e.g. `https://givtask.vercel.app`)
5. Deploy

### Environment Variables

| Variable       | Required | Description                              |
|----------------|----------|------------------------------------------|
| `SECRET_KEY`   | Yes      | Flask secret key                         |
| `CORS_ORIGINS` | Yes      | Frontend URL (or `*` for open access)    |
| `DATABASE_URL` | No       | Defaults to SQLite (works on Render free tier) |

> Note: Render free tier spins down after inactivity. The first request may take ~30s to wake.
