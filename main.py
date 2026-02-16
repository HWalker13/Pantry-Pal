from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import date

app = FastAPI()

# This is our "database" for now - just a Python list in memory
pantry_items = []

# This is the start id for post endpoitn
next_id = 1

# Define what a pantry item looks like


class PantryItem(BaseModel):
    name: str
    quantity: int
    expiration_date: date
    category: str  # like "dairy", "produce", "meat"

# GET =====================================================================================


@app.get("/")
def root():
    return {"message": "Pantry Pal API is running!"}


# GET all items
@app.get("/pantry/items")
def get_items():
    return {"items": pantry_items}


# GET single item by ID
@app.get("/pantry/items/{item_id}")
def get_item(item_id: int):
    for item in pantry_items:
        if item["id"] == item_id:
            return item
    return {"error": "Item not found"}

# POST ===================================================================================


# POST new item
@app.post("/pantry/items")
def add_item(item: PantryItem):
    global next_id  # This lets us modify the next_id variable

    # Convert the item to a dictionary and add an ID
    item_dict = item.dict()
    item_dict["id"] = next_id
    next_id += 1  # Increment for the next item

    pantry_items.append(item_dict)
    return {"message": "Item added!", "item": item_dict}


# DELETE ====================================================================================


@app.delete("/pantry/items/{item_id}")
def delete_item(item_id: int):
    # Find the item with this ID
    for i, item in enumerate(pantry_items):
        if item["id"] == item_id:
            deleted_item = pantry_items.pop(i)
            return {"message": "Item deleted!", "item": deleted_item}

    # If we get here, item wasn't found
    return {"error": "Item not found"}


# PUT =====================================================================================


@app.put("/pantry/items/{item_id}")
def update_item(item_id: int, updated_item: PantryItem):
    # Find the item with this ID
    for i, item in enumerate(pantry_items):
        if item["id"] == item_id:
            # Keep the original ID, update everything else
            item_dict = updated_item.dict()
            item_dict["id"] = item_id  # Don't let the ID change!
            pantry_items[i] = item_dict
            return {"message": "Item updated!", "item": item_dict}

    # If we get here, item wasn't found
    return {"error": "Item not found"}
