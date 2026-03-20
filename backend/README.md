# Pantry Pal API

A RESTful backend API for tracking pantry inventory and food expiration dates. Built to prevent food waste by alerting users to items expiring soon.

## Tech Stack

- **Python 3.14** + **FastAPI** — API framework
- **PostgreSQL** — persistent database
- **SQLAlchemy** — ORM for database interaction
- **Pydantic v2** — request validation
- **Uvicorn** — ASGI server

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL installed and running locally

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
   git clone https://github.com/HWalker13/Pantry-Pal.git
   cd "Pantry Pal/backend"
```

2. Create and activate a virtual environment:
```bash
   python -m venv .venv
   source .venv/bin/activate
```

3. Install dependencies:
```bash
   pip install -r requirements.txt
```

4. Create a `.env` file with your database connection string:
```
   DATABASE_URL=postgresql://<your-username>@localhost/pantry_pal
```

5. Start the server:
```bash
   uvicorn main:app --reload
```

6. Visit `http://localhost:8000/docs` for the interactive API documentation.

## API Endpoints

| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | `/`                           | Health check                     |
| GET    | `/pantry/items`               | Get all pantry items             |
| GET    | `/pantry/items/expiring-soon` | Items expiring within 7 days     |
| GET    | `/pantry/items/expired`       | Items past their expiration date |
| GET    | `/pantry/items/{id}`          | Get a single item by ID          |
| POST   | `/pantry/items`               | Add a new item                   |
| PUT    | `/pantry/items/{id}`          | Update an existing item          |
| DELETE | `/pantry/items/{id}`          | Delete an item                   |

## Running Tests
```bash
python -m pytest test_main.py -v
```

## Project Status

Currently in active development. Backend API is complete with full test coverage. User authentication and a frontend are planned for upcoming phases.