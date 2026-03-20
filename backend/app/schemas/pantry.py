from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class PantryItem(BaseModel):
    name: str
    category: str
    quantity: Optional[int] = None
    unit: Optional[str] = None
    expiration_date: Optional[date] = None


class AIRecipe(BaseModel):
    name: str
    description: str
    ingredients: List[str]
    instructions: str
    uses_from_pantry: List[str]


class AIRecipeSuggestionsResponse(BaseModel):
    recipes: List[AIRecipe]


class RecipeSuggestion(BaseModel):
    id: int
    name: str
    description: str
    missing_ingredients: List[str]
    missing_count: int

    model_config = {"from_attributes": True}
