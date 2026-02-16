from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import date

app = FastAPI()

# This is our "database" for now - just a Python list in memory
pantry_items = []

# Define what a pantry item looks like


class PantryItem(BaseModel):
    name: str
    quantity: int
    expiration_date: date
    category: str  # like "dairy", "produce", "meat"


@app.get("/")
def root():
    return {"message": "Pantry Pal API is running!"}

# GET all items


@app.get("/pantry/items")
def get_items():
    return {"items": pantry_items}

# POST new item


@app.post("/pantry/items")
def add_item(item: PantryItem):
    pantry_items.append(item.dict())
    return {"message": "Item added!", "item": item}
