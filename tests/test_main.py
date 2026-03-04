from datetime import date, timedelta

from tests.conftest import client


# --- HELPER DATA ---

def sample_item(days_until_expiry=10):
    return {
        "name": "Test Milk",
        "quantity": 2,
        "expiration_date": str(date.today() + timedelta(days=days_until_expiry)),
        "category": "dairy"
    }


def create_test_user(email="test@example.com", password="testpassword123"):
    """Register a user and return their JWT token."""
    client.post("/auth/register", json={"email": email, "password": password})
    resp = client.post("/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


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
    token = create_test_user()
    response = client.post("/pantry/items", json=sample_item(), headers=auth_headers(token))
    assert response.status_code == 200
    data = response.json()
    assert data["item"]["name"] == "Test Milk"
    assert data["item"]["category"] == "dairy"
    assert "id" in data["item"]  # DB assigned an ID


def test_get_all_items_empty():
    """GET /pantry/items on an empty pantry should return an empty list."""
    token = create_test_user()
    response = client.get("/pantry/items", headers=auth_headers(token))
    assert response.status_code == 200
    assert response.json() == {"items": []}


def test_get_all_items_with_data():
    """After adding an item, GET /pantry/items should return it."""
    token = create_test_user()
    client.post("/pantry/items", json=sample_item(), headers=auth_headers(token))
    response = client.get("/pantry/items", headers=auth_headers(token))
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


def test_get_single_item():
    """GET /pantry/items/{id} should return the correct item."""
    token = create_test_user()
    create_response = client.post("/pantry/items", json=sample_item(), headers=auth_headers(token))
    item_id = create_response.json()["item"]["id"]

    response = client.get(f"/pantry/items/{item_id}", headers=auth_headers(token))
    assert response.status_code == 200
    assert response.json()["name"] == "Test Milk"


def test_get_item_not_found():
    """GET /pantry/items/9999 should return 404 when item doesn't exist."""
    token = create_test_user()
    response = client.get("/pantry/items/9999", headers=auth_headers(token))
    assert response.status_code == 404


def test_update_item():
    """PUT /pantry/items/{id} should update the item's fields."""
    token = create_test_user()
    create_response = client.post("/pantry/items", json=sample_item(), headers=auth_headers(token))
    item_id = create_response.json()["item"]["id"]

    updated = sample_item()
    updated["name"] = "Whole Milk"
    updated["quantity"] = 5

    response = client.put(f"/pantry/items/{item_id}", json=updated, headers=auth_headers(token))
    assert response.status_code == 200
    assert response.json()["item"]["name"] == "Whole Milk"
    assert response.json()["item"]["quantity"] == 5


def test_update_item_not_found():
    """PUT on a nonexistent item should return 404."""
    token = create_test_user()
    response = client.put("/pantry/items/9999", json=sample_item(), headers=auth_headers(token))
    assert response.status_code == 404


def test_delete_item():
    """DELETE /pantry/items/{id} should remove the item."""
    token = create_test_user()
    create_response = client.post("/pantry/items", json=sample_item(), headers=auth_headers(token))
    item_id = create_response.json()["item"]["id"]

    delete_response = client.delete(f"/pantry/items/{item_id}", headers=auth_headers(token))
    assert delete_response.status_code == 200

    # Confirm it's actually gone
    get_response = client.get(f"/pantry/items/{item_id}", headers=auth_headers(token))
    assert get_response.status_code == 404


def test_delete_item_not_found():
    """DELETE on a nonexistent item should return 404."""
    token = create_test_user()
    response = client.delete("/pantry/items/9999", headers=auth_headers(token))
    assert response.status_code == 404


def test_expiring_soon():
    """Items expiring within 7 days should appear in /expiring-soon."""
    token = create_test_user()
    expiring = sample_item(days_until_expiry=3)   # Expires in 3 days — should appear
    fine = sample_item(days_until_expiry=30)       # Expires in 30 days — should NOT appear
    fine["name"] = "Fine Yogurt"

    client.post("/pantry/items", json=expiring, headers=auth_headers(token))
    client.post("/pantry/items", json=fine, headers=auth_headers(token))

    response = client.get("/pantry/items/expiring-soon", headers=auth_headers(token))
    assert response.status_code == 200
    results = response.json()["expiring_soon"]
    assert len(results) == 1
    assert results[0]["name"] == "Test Milk"


def test_expired_items():
    """Items past their expiration date should appear in /expired."""
    token = create_test_user()
    expired = sample_item(days_until_expiry=-5)    # Expired 5 days ago
    expired["name"] = "Old Cheese"
    fresh = sample_item(days_until_expiry=10)

    client.post("/pantry/items", json=expired, headers=auth_headers(token))
    client.post("/pantry/items", json=fresh, headers=auth_headers(token))

    response = client.get("/pantry/items/expired", headers=auth_headers(token))
    assert response.status_code == 200
    results = response.json()["expired"]
    assert len(results) == 1
    assert results[0]["name"] == "Old Cheese"


# =============================================================================
# AUTH TESTS
# =============================================================================

def test_register_user():
    """POST /auth/register should create a user and return user data."""
    response = client.post("/auth/register", json={"email": "a@example.com", "password": "secret123"})
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "a@example.com"
    assert "id" in data
    assert "created_at" in data
    assert "hashed_password" not in data


def test_register_duplicate_email():
    """Registering with the same email twice should return 400."""
    client.post("/auth/register", json={"email": "dup@example.com", "password": "pass1"})
    response = client.post("/auth/register", json={"email": "dup@example.com", "password": "pass2"})
    assert response.status_code == 400


def test_login_returns_token():
    """POST /auth/login with valid credentials should return an access_token."""
    client.post("/auth/register", json={"email": "login@example.com", "password": "mypass"})
    response = client.post("/auth/login", json={"email": "login@example.com", "password": "mypass"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    """POST /auth/login with wrong password should return 401."""
    client.post("/auth/register", json={"email": "wp@example.com", "password": "correct"})
    response = client.post("/auth/login", json={"email": "wp@example.com", "password": "wrong"})
    assert response.status_code == 401


def test_pantry_requires_auth():
    """GET /pantry/items without a token should return 401."""
    response = client.get("/pantry/items")
    assert response.status_code == 401


def test_pantry_with_valid_token():
    """GET /pantry/items with a valid token should return 200."""
    token = create_test_user()
    response = client.get("/pantry/items", headers=auth_headers(token))
    assert response.status_code == 200


def test_pantry_isolation():
    """User A's items should not appear in User B's pantry."""
    token_a = create_test_user(email="user_a@example.com")
    token_b = create_test_user(email="user_b@example.com")

    client.post("/pantry/items", json=sample_item(), headers=auth_headers(token_a))

    response = client.get("/pantry/items", headers=auth_headers(token_b))
    assert response.status_code == 200
    assert response.json()["items"] == []
