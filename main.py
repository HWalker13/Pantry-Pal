from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
import models
from database import engine, Base, get_db
from auth import get_current_user, hash_password, verify_password, create_access_token

# Creates the database tables on startup if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Pydantic schemas =========================================================================


class PantryItem(BaseModel):
    name: str
    quantity: int
    expiration_date: date
    category: str  # like "dairy", "produce", "meat"


class RecipeSuggestion(BaseModel):
    id: int
    name: str
    description: str
    missing_ingredients: List[str]
    missing_count: int

    model_config = {"from_attributes": True}


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# AUTH =====================================================================================


@app.get("/")
def health():
    return {"message": "Pantry Pal API is running!"}


@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer"}


# GET =====================================================================================


# GET all items
@app.get("/pantry/items")
def get_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id
    ).all()
    return {"items": items}


# GET items expiring within the next 7 days
@app.get("/pantry/items/expiring-soon")
def get_expiring_soon(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    seven_days = today + timedelta(days=7)
    items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id,
        models.PantryItem.expiration_date >= today,
        models.PantryItem.expiration_date <= seven_days,
    ).all()
    return {"expiring_soon": items}


# GET items that are already expired
@app.get("/pantry/items/expired")
def get_expired(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id,
        models.PantryItem.expiration_date < today,
    ).all()
    return {"expired": items}


# GET single item by ID
@app.get("/pantry/items/{item_id}")
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id,
        models.PantryItem.user_id == current_user.id,
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# POST ===================================================================================


# POST new item
@app.post("/pantry/items")
def add_item(
    item: PantryItem,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_item = models.PantryItem(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"message": "Item added!", "item": db_item}


# DELETE ====================================================================================


@app.delete("/pantry/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id,
        models.PantryItem.user_id == current_user.id,
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted!", "item": item}


# PUT =====================================================================================


@app.put("/pantry/items/{item_id}")
def update_item(
    item_id: int,
    updated_item: PantryItem,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id,
        models.PantryItem.user_id == current_user.id,
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in updated_item.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return {"message": "Item updated!", "item": item}


# RECIPES ==================================================================================


@app.get("/recipes/suggestions", response_model=List[RecipeSuggestion])
def get_recipe_suggestions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pantry_items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id
    ).all()
    pantry_names = {item.name.lower() for item in pantry_items}

    recipes = db.query(models.Recipe).all()

    suggestions = []
    for recipe in recipes:
        missing = [
            ing.ingredient_name
            for ing in recipe.ingredients
            if ing.ingredient_name.lower() not in pantry_names
        ]
        suggestions.append(RecipeSuggestion(
            id=recipe.id,
            name=recipe.name,
            description=recipe.description,
            missing_ingredients=missing,
            missing_count=len(missing),
        ))

    suggestions.sort(key=lambda r: r.missing_count)
    return suggestions[:10]
