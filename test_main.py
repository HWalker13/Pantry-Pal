import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, timedelta

from main import app
from database import Base, get_db

# --- TEST DATABASE SETUP ---
# We use an in-memory SQLite database for tests.
# "check_same_thread" is a SQLite-specific setting we disable for testing.
# This database only exists while tests are running — nothing persists.
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


# --- DEPENDENCY OVERRIDE ---
# FastAPI has a built-in system for swapping out dependencies during tests.
# Your API uses get_db() to get a database session. Here, we replace it
# with a version that uses our test database instead of your real one.
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# --- TEST CLIENT ---
# This is your fake API. It lets you call endpoints like real HTTP requests
# without running a server. Think of it as Swagger UI, but in code.
client = TestClient(app)


# --- FIXTURES ---
# A pytest "fixture" is a reusable setup function. The @pytest.fixture decorator
# tells pytest to run this before each test that requests it.
# This fixture creates all tables before a test and drops them after.
# Result: every test starts with a completely clean, empty database.
@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)   # Create tables
    yield                                    # Run the test
    Base.metadata.drop_all(bind=engine)     # Drop tables after


# --- HELPER DATA ---
# Reusable sample item so you're not copying this dict in every test.
def sample_item(days_until_expiry=10):
    return {
        "name": "Test Milk",
        "quantity": 2,
        "expiration_date": str(date.today() + timedelta(days=days_until_expiry)),
        "category": "dairy"
    }


# =============================================================================
# THE TESTS
# =============================================================================

def test_health_check():
    """The root endpoint should confirm the API is running."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Pantry Pal API is running!"}


def test_create_item():
    """POST /pantry/items should add an item and return it."""
    response = client.post("/pantry/items", json=sample_item())
    assert response.status_code == 200
    data = response.json()
    assert data["item"]["name"] == "Test Milk"
    assert data["item"]["category"] == "dairy"
    assert "id" in data["item"]  # DB assigned an ID


def test_get_all_items_empty():
    """GET /pantry/items on an empty pantry should return an empty list."""
    response = client.get("/pantry/items")
    assert response.status_code == 200
    assert response.json() == {"items": []}


def test_get_all_items_with_data():
    """After adding an item, GET /pantry/items should return it."""
    client.post("/pantry/items", json=sample_item())
    response = client.get("/pantry/items")
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


def test_get_single_item():
    """GET /pantry/items/{id} should return the correct item."""
    create_response = client.post("/pantry/items", json=sample_item())
    item_id = create_response.json()["item"]["id"]

    response = client.get(f"/pantry/items/{item_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Milk"


def test_get_item_not_found():
    """GET /pantry/items/9999 should return 404 when item doesn't exist."""
    response = client.get("/pantry/items/9999")
    assert response.status_code == 404


def test_update_item():
    """PUT /pantry/items/{id} should update the item's fields."""
    create_response = client.post("/pantry/items", json=sample_item())
    item_id = create_response.json()["item"]["id"]

    updated = sample_item()
    updated["name"] = "Whole Milk"
    updated["quantity"] = 5

    response = client.put(f"/pantry/items/{item_id}", json=updated)
    assert response.status_code == 200
    assert response.json()["item"]["name"] == "Whole Milk"
    assert response.json()["item"]["quantity"] == 5


def test_update_item_not_found():
    """PUT on a nonexistent item should return 404."""
    response = client.put(f"/pantry/items/9999", json=sample_item())
    assert response.status_code == 404


def test_delete_item():
    """DELETE /pantry/items/{id} should remove the item."""
    create_response = client.post("/pantry/items", json=sample_item())
    item_id = create_response.json()["item"]["id"]

    delete_response = client.delete(f"/pantry/items/{item_id}")
    assert delete_response.status_code == 200

    # Confirm it's actually gone
    get_response = client.get(f"/pantry/items/{item_id}")
    assert get_response.status_code == 404


def test_delete_item_not_found():
    """DELETE on a nonexistent item should return 404."""
    response = client.delete("/pantry/items/9999")
    assert response.status_code == 404


def test_expiring_soon():
    """Items expiring within 7 days should appear in /expiring-soon."""
    expiring = sample_item(
        days_until_expiry=3)   # Expires in 3 days — should appear
    # Expires in 30 days — should NOT appear
    fine = sample_item(days_until_expiry=30)
    fine["name"] = "Fine Yogurt"

    client.post("/pantry/items", json=expiring)
    client.post("/pantry/items", json=fine)

    response = client.get("/pantry/items/expiring-soon")
    assert response.status_code == 200
    results = response.json()["expiring_soon"]
    assert len(results) == 1
    assert results[0]["name"] == "Test Milk"


def test_expired_items():
    """Items past their expiration date should appear in /expired."""
    expired = sample_item(days_until_expiry=-5)    # Expired 5 days ago
    expired["name"] = "Old Cheese"
    fresh = sample_item(days_until_expiry=10)

    client.post("/pantry/items", json=expired)
    client.post("/pantry/items", json=fresh)

    response = client.get("/pantry/items/expired")
    assert response.status_code == 200
    results = response.json()["expired"]
    assert len(results) == 1
    assert results[0]["name"] == "Old Cheese"
