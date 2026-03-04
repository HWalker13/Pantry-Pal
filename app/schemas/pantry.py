from pydantic import BaseModel
from datetime import date
from typing import List


class PantryItem(BaseModel):
    name: str
    quantity: int
    expiration_date: date
    category: str


class RecipeSuggestion(BaseModel):
    id: int
    name: str
    description: str
    missing_ingredients: List[str]
    missing_count: int

    model_config = {"from_attributes": True}
