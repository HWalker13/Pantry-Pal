import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, timedelta

from main import app
from database import Base, get_db
import models

# --- TEST DATABASE SETUP ---
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# --- HELPERS ---

def create_recipe(name, description, instructions, ingredients):
    """Insert a recipe directly into the test DB. ingredients is a list of dicts."""
    db = TestingSessionLocal()
    try:
        recipe = models.Recipe(name=name, description=description, instructions=instructions)
        db.add(recipe)
        db.flush()
        for ing in ingredients:
            db.add(models.RecipeIngredient(recipe_id=recipe.id, **ing))
        db.commit()
        db.refresh(recipe)
        return recipe.id
    finally:
        db.close()


def add_pantry_item(name):
    client.post("/pantry/items", json={
        "name": name,
        "quantity": 1,
        "expiration_date": str(date.today() + timedelta(days=30)),
        "category": "other",
    })


# =============================================================================
# THE TESTS
# =============================================================================

def test_suggestions_sorted_by_missing_count():
    """Recipes with fewer missing ingredients should appear first."""
    # Recipe A: needs 3 ingredients, pantry has 1 → 2 missing
    create_recipe(
        name="Recipe A",
        description="Needs a lot",
        instructions="Cook it.",
        ingredients=[
            {"ingredient_name": "eggs", "quantity": 2.0, "unit": "whole"},
            {"ingredient_name": "flour", "quantity": 1.0, "unit": "cup"},
            {"ingredient_name": "butter", "quantity": 1.0, "unit": "tbsp"},
        ],
    )
    # Recipe B: needs 1 ingredient, pantry has it → 0 missing
    create_recipe(
        name="Recipe B",
        description="Easy to make",
        instructions="Just use eggs.",
        ingredients=[
            {"ingredient_name": "eggs", "quantity": 2.0, "unit": "whole"},
        ],
    )

    add_pantry_item("eggs")

    response = client.get("/recipes/suggestions")
    assert response.status_code == 200
    results = response.json()

    assert len(results) == 2
    assert results[0]["name"] == "Recipe B"
    assert results[0]["missing_count"] == 0
    assert results[1]["name"] == "Recipe A"
    assert results[1]["missing_count"] == 2


def test_suggestions_empty_pantry():
    """With no pantry items, all recipe ingredients should be missing."""
    create_recipe(
        name="Simple Recipe",
        description="Three ingredients",
        instructions="Mix and cook.",
        ingredients=[
            {"ingredient_name": "eggs", "quantity": 2.0, "unit": "whole"},
            {"ingredient_name": "flour", "quantity": 1.0, "unit": "cup"},
            {"ingredient_name": "butter", "quantity": 1.0, "unit": "tbsp"},
        ],
    )

    response = client.get("/recipes/suggestions")
    assert response.status_code == 200
    results = response.json()

    assert len(results) == 1
    assert results[0]["missing_count"] == 3
    assert set(results[0]["missing_ingredients"]) == {"eggs", "flour", "butter"}


def test_suggestions_full_pantry_match():
    """When the pantry has all ingredients, missing_count should be 0."""
    create_recipe(
        name="Eggs and Butter",
        description="Simple pantry recipe",
        instructions="Cook eggs in butter.",
        ingredients=[
            {"ingredient_name": "eggs", "quantity": 2.0, "unit": "whole"},
            {"ingredient_name": "butter", "quantity": 1.0, "unit": "tbsp"},
        ],
    )

    add_pantry_item("eggs")
    add_pantry_item("butter")

    response = client.get("/recipes/suggestions")
    assert response.status_code == 200
    results = response.json()

    assert len(results) == 1
    assert results[0]["missing_count"] == 0
    assert results[0]["missing_ingredients"] == []


def test_suggestions_response_schema():
    """Each suggestion should have the correct fields with correct types."""
    create_recipe(
        name="Schema Test Recipe",
        description="Testing the response shape",
        instructions="Do something with garlic.",
        ingredients=[
            {"ingredient_name": "garlic", "quantity": 3.0, "unit": "cloves"},
        ],
    )

    response = client.get("/recipes/suggestions")
    assert response.status_code == 200
    results = response.json()

    assert len(results) == 1
    result = results[0]

    assert "id" in result
    assert "name" in result
    assert "description" in result
    assert "missing_ingredients" in result
    assert "missing_count" in result

    assert isinstance(result["id"], int)
    assert isinstance(result["name"], str)
    assert isinstance(result["description"], str)
    assert isinstance(result["missing_ingredients"], list)
    assert isinstance(result["missing_count"], int)
