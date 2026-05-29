# 🌿 Pantry Pal

A full-stack pantry management web app that tracks your ingredients and uses AI to suggest recipes based on what you already have. Built as a portfolio project to demonstrate backend architecture, authentication, and AI integration.

**Live Demo:** [pantry-pal-frontend-ckce.onrender.com](https://pantry-pal-frontend-ckce.onrender.com)

---

## What It Does

- Add and track pantry ingredients with category, quantity, unit, and expiration date
- Get warned when items are expiring soon
- Ask the AI to generate recipe suggestions from whatever is currently in your pantry
- All data is user-isolated — every account has its own private pantry

---

## Tech Stack

**Backend**
- Python + FastAPI
- PostgreSQL (hosted on Supabase)
- SQLAlchemy ORM
- JWT authentication (via `python-jose` + `passlib`)
- Groq AI (Llama 3) for recipe generation
- Pytest for test coverage

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router v7

**Infrastructure**
- Backend: Render (web service)
- Frontend: Render (static site)
- Database: Supabase (managed PostgreSQL)

---

## Project Structure

```
Pantry Pal/
├── backend/
│   ├── app/
│   │   ├── main.py           # App entrypoint, router wiring
│   │   ├── database.py       # DB connection and session
│   │   ├── dependencies.py   # get_db, get_current_user
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── pantry_item.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── pantry_item.py
│   │   ├── routers/
│   │   │   ├── auth.py       # /register, /login
│   │   │   ├── pantry.py     # /pantry/items
│   │   │   └── recipes.py    # /recipes/ai-suggestions
│   │   └── services/
│   │       └── ai_client.py  # Groq provider abstraction
│   └── tests/
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Register.jsx
    │   └── components/
    └── public/
```

---

## API Endpoints

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Login and receive a JWT |
| GET | `/pantry/items` | Yes | Get all pantry items for the current user |
| POST | `/pantry/items` | Yes | Add a new pantry item |
| DELETE | `/pantry/items/{id}` | Yes | Delete an item |
| GET | `/pantry/items/expiring-soon` | Yes | Items expiring within 7 days |
| GET | `/pantry/items/expired` | Yes | Items past their expiration date |
| GET | `/recipes/ai-suggestions` | Yes | Generate AI recipe suggestions from pantry |

---

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally (or a Supabase connection string)

### Backend

Open a terminal and run:

```bash
cd "Pantry Pal/backend"
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with:

```
DATABASE_URL=postgresql://<your-user>@localhost/pantry_pal
SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

Start the server:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

Open a second terminal tab and run:

```bash
cd "Pantry Pal/frontend"
npm install --legacy-peer-deps
npm run dev
```

App available at `http://localhost:5173`

---

## Running Tests

From the `backend/` directory with the virtual environment active:

```bash
pytest
```

The test suite covers all auth and pantry endpoints using FastAPI's `TestClient`.

---

## Architecture Notes

**Why a provider abstraction layer for AI?**
The Groq client lives in `services/ai_client.py` behind a generic interface. Swapping to OpenAI or Anthropic requires changing one file, not hunting through routes. This is a real backend design decision — it avoids vendor lock-in and makes the AI dependency explicit and testable.

**Why JWT over sessions?**
JWTs are stateless — the server doesn't store anything. The token is signed with a secret key, sent to the client on login, and included in the `Authorization` header on every subsequent request. The server just decodes and verifies it. This scales without a session store.

**Why user-isolated data?**
Every `pantry_item` row has a `user_id` foreign key. Every query filters by the user extracted from the JWT. You can't read or modify another user's pantry — it's enforced at the database query level, not the frontend.

---

## Deployment

- **Backend** is deployed as a web service on Render. It sleeps after 15 minutes of inactivity and has a ~30 second cold start on the first request.
- **Frontend** is deployed as a static site on Render. It never sleeps.
- **Database** is hosted on Supabase. The free tier pauses after 90 days of zero activity but data is preserved — just click unpause.
