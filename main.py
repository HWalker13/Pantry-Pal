from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

# Creates the database tables on startup if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Define what a pantry item looks like


class PantryItem(BaseModel):
    name: str
    quantity: int
    expiration_date: date
    category: str  # like "dairy", "produce", "meat"

# Opens and closes a database session for each request


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET =====================================================================================


@app.get("/")
def health():
    return {"message": "Pantry Pal API is running!"}

# GET all items


@app.get("/pantry/items")
def get_items(db: Session = Depends(get_db)):
    items = db.query(models.PantryItem).all()
    return {"items": items}

# GET single item by ID


@app.get("/pantry/items/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# POST ===================================================================================

# POST new item


@app.post("/pantry/items")
def add_item(item: PantryItem, db: Session = Depends(get_db)):
    db_item = models.PantryItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"message": "Item added!", "item": db_item}

# DELETE ====================================================================================


@app.delete("/pantry/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted!", "item": item}

# PUT =====================================================================================


@app.put("/pantry/items/{item_id}")
def update_item(item_id: int, updated_item: PantryItem, db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(
        models.PantryItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in updated_item.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return {"message": "Item updated!", "item": item}
