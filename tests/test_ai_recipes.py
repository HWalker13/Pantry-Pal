from datetime import date, timedelta
from unittest.mock import patch
from fastapi import HTTPException

from tests.conftest import client


MOCK_RESPONSE = {
    "recipes": [{
        "name": "Scrambled Eggs",
        "description": "Simple eggs dish",
        "ingredients": ["2 eggs", "1 tbsp butter"],
        "instructions": "Crack eggs, cook in butter.",
        "uses_from_pantry": ["eggs", "butter"],
    }]
}


# --- HELPERS ---

def register_and_login(email="ai_test@example.com", password="testpass"):
    client.post("/auth/register", json={"email": email, "password": password})
    resp = client.post("/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def add_pantry_item(name, token):
    response = client.post("/pantry/items", json={
        "name": name,
        "quantity": 1,
        "expiration_date": str(date.today() + timedelta(days=30)),
        "category": "other",
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


# =============================================================================
# TESTS
# =============================================================================

def test_ai_suggestions_happy_path():
    token = register_and_login("ai_happy@example.com")
    add_pantry_item("eggs", token)
    add_pantry_item("butter", token)

    with patch("app.routers.recipes.ai_get_recipe_suggestions", return_value=MOCK_RESPONSE):
        response = client.get(
            "/recipes/ai-suggestions",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "recipes" in data
    assert len(data["recipes"]) == 1
    assert data["recipes"][0]["name"] == "Scrambled Eggs"
    assert "uses_from_pantry" in data["recipes"][0]


def test_ai_suggestions_empty_pantry():
    token = register_and_login("ai_empty@example.com")

    with patch("app.routers.recipes.ai_get_recipe_suggestions") as mock_ai:
        response = client.get(
            "/recipes/ai-suggestions",
            headers={"Authorization": f"Bearer {token}"},
        )
        mock_ai.assert_not_called()

    assert response.status_code == 400
    assert response.json()["detail"] == "Pantry is empty. Add items first."


def test_ai_suggestions_requires_auth():
    response = client.get("/recipes/ai-suggestions")
    assert response.status_code == 401


def test_ai_suggestions_malformed_response():
    token = register_and_login("ai_malformed@example.com")
    add_pantry_item("eggs", token)

    with patch(
        "app.routers.recipes.ai_get_recipe_suggestions",
        side_effect=HTTPException(status_code=502, detail="AI returned malformed response"),
    ):
        response = client.get(
            "/recipes/ai-suggestions",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 502
    assert response.json()["detail"] == "AI returned malformed response"


def test_ai_suggestions_missing_api_key():
    token = register_and_login("ai_nokey@example.com")
    add_pantry_item("eggs", token)

    with patch(
        "app.routers.recipes.ai_get_recipe_suggestions",
        side_effect=HTTPException(status_code=500, detail="AI service not configured"),
    ):
        response = client.get(
            "/recipes/ai-suggestions",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 500
    assert response.json()["detail"] == "AI service not configured"
