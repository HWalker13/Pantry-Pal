from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import app.models as models
from app.schemas.pantry import RecipeSuggestion, AIRecipeSuggestionsResponse
from app.dependencies import get_db, get_current_user
from app.services.ai_client import get_recipe_suggestions as ai_get_recipe_suggestions

router = APIRouter(prefix="/recipes")


@router.get("/suggestions", response_model=List[RecipeSuggestion])
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


@router.get("/ai-suggestions", response_model=AIRecipeSuggestionsResponse)
def get_ai_recipe_suggestions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pantry_items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id
    ).all()

    if not pantry_items:
        raise HTTPException(status_code=400, detail="Pantry is empty. Add items first.")

    pantry_summary = ", ".join(
        f"{item.name} ({item.quantity})" for item in pantry_items
    )

    data = ai_get_recipe_suggestions(pantry_summary)
    return AIRecipeSuggestionsResponse(**data)
