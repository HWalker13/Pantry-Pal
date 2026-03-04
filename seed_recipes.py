from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)

RECIPES = [
    {
        "name": "Spaghetti Aglio e Olio",
        "description": "Classic Italian pasta with garlic and olive oil.",
        "instructions": "Cook pasta. Sauté garlic in olive oil until golden. Toss with pasta, salt, and pepper.",
        "ingredients": [
            {"ingredient_name": "pasta", "quantity": 200, "unit": "grams"},
            {"ingredient_name": "garlic", "quantity": 4, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 3, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 1, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Classic Scrambled Eggs",
        "description": "Soft, creamy scrambled eggs — a perfect quick breakfast.",
        "instructions": "Whisk eggs with milk. Melt butter in pan over low heat. Add eggs and stir slowly until just set.",
        "ingredients": [
            {"ingredient_name": "eggs", "quantity": 3, "unit": "whole"},
            {"ingredient_name": "butter", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "milk", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 0.25, "unit": "tsp"},
        ],
    },
    {
        "name": "Garlic Butter Pasta",
        "description": "Simple weeknight pasta with rich garlic butter sauce.",
        "instructions": "Cook pasta. In a pan, melt butter and sauté garlic. Toss with pasta and season with salt and pepper.",
        "ingredients": [
            {"ingredient_name": "pasta", "quantity": 200, "unit": "grams"},
            {"ingredient_name": "butter", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.25, "unit": "tsp"},
        ],
    },
    {
        "name": "Tomato Rice",
        "description": "Savory one-pot rice cooked with canned tomatoes and garlic.",
        "instructions": "Sauté onion and garlic in olive oil. Add rice and canned tomatoes. Pour in broth and simmer until rice is cooked.",
        "ingredients": [
            {"ingredient_name": "rice", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "canned tomatoes", "quantity": 1, "unit": "can"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "chicken broth", "quantity": 1.5, "unit": "cups"},
        ],
    },
    {
        "name": "Chicken Stir Fry",
        "description": "Quick and flavorful chicken and rice stir fry with soy sauce.",
        "instructions": "Cook rice. Sauté chicken in olive oil until cooked through. Add garlic, onion, and soy sauce. Serve over rice.",
        "ingredients": [
            {"ingredient_name": "chicken", "quantity": 300, "unit": "grams"},
            {"ingredient_name": "rice", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "soy sauce", "quantity": 3, "unit": "tbsp"},
            {"ingredient_name": "olive oil", "quantity": 2, "unit": "tbsp"},
        ],
    },
    {
        "name": "Garlic Roasted Potatoes",
        "description": "Crispy oven-roasted potatoes with garlic and olive oil.",
        "instructions": "Cut potatoes into chunks. Toss with olive oil, garlic, salt, and pepper. Roast at 425°F for 35 minutes.",
        "ingredients": [
            {"ingredient_name": "potatoes", "quantity": 4, "unit": "whole"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 3, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 1, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Bean and Rice Bowl",
        "description": "Hearty vegetarian bowl with seasoned canned beans and rice.",
        "instructions": "Cook rice. Heat canned beans with garlic, onion, and olive oil. Season with salt. Serve beans over rice.",
        "ingredients": [
            {"ingredient_name": "rice", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "canned beans", "quantity": 1, "unit": "can"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "onion", "quantity": 0.5, "unit": "whole"},
            {"ingredient_name": "olive oil", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Mushroom Risotto",
        "description": "Creamy risotto with sautéed mushrooms and butter.",
        "instructions": "Sauté mushrooms and onion in butter. Add rice and ladle in warm chicken broth gradually, stirring constantly. Finish with cheese.",
        "ingredients": [
            {"ingredient_name": "rice", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "mushrooms", "quantity": 200, "unit": "grams"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "butter", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "chicken broth", "quantity": 3, "unit": "cups"},
            {"ingredient_name": "cheese", "quantity": 50, "unit": "grams"},
        ],
    },
    {
        "name": "Lemon Butter Chicken",
        "description": "Pan-seared chicken with a bright lemon butter sauce.",
        "instructions": "Season chicken with salt and pepper. Sear in olive oil until golden. Add butter, garlic, and lemon juice. Baste and serve.",
        "ingredients": [
            {"ingredient_name": "chicken", "quantity": 400, "unit": "grams"},
            {"ingredient_name": "butter", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "lemon", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "olive oil", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.25, "unit": "tsp"},
        ],
    },
    {
        "name": "French Toast",
        "description": "Golden pan-fried bread soaked in a sweet egg and milk custard.",
        "instructions": "Whisk eggs, milk, and sugar together. Dip bread slices and fry in butter until golden on each side.",
        "ingredients": [
            {"ingredient_name": "eggs", "quantity": 2, "unit": "whole"},
            {"ingredient_name": "milk", "quantity": 0.25, "unit": "cup"},
            {"ingredient_name": "butter", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "sugar", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "bread", "quantity": 4, "unit": "slices"},
        ],
    },
    {
        "name": "Pasta Pomodoro",
        "description": "Light tomato sauce pasta with garlic and olive oil.",
        "instructions": "Sauté garlic in olive oil. Add canned tomatoes and simmer 15 minutes. Toss with cooked pasta and season.",
        "ingredients": [
            {"ingredient_name": "pasta", "quantity": 200, "unit": "grams"},
            {"ingredient_name": "canned tomatoes", "quantity": 1, "unit": "can"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Bacon and Egg Fried Rice",
        "description": "Savory fried rice with crispy bacon and scrambled eggs.",
        "instructions": "Cook rice and let cool. Fry bacon until crispy. Scramble eggs in the same pan. Add rice and soy sauce, stir fry everything together.",
        "ingredients": [
            {"ingredient_name": "rice", "quantity": 2, "unit": "cups"},
            {"ingredient_name": "eggs", "quantity": 2, "unit": "whole"},
            {"ingredient_name": "bacon", "quantity": 4, "unit": "strips"},
            {"ingredient_name": "soy sauce", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
        ],
    },
    {
        "name": "Creamy Mushroom Soup",
        "description": "Rich and velvety mushroom soup with heavy cream.",
        "instructions": "Sauté onion and mushrooms in butter. Add chicken broth and simmer 10 minutes. Blend until smooth. Stir in heavy cream and season.",
        "ingredients": [
            {"ingredient_name": "mushrooms", "quantity": 300, "unit": "grams"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "butter", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "chicken broth", "quantity": 2, "unit": "cups"},
            {"ingredient_name": "heavy cream", "quantity": 0.5, "unit": "cup"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Baked Chicken Thighs",
        "description": "Simple oven-baked chicken thighs with garlic and olive oil.",
        "instructions": "Season chicken with salt, pepper, and garlic. Drizzle with olive oil and bake at 400°F for 35–40 minutes.",
        "ingredients": [
            {"ingredient_name": "chicken", "quantity": 4, "unit": "pieces"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 1, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Spinach and Egg Scramble",
        "description": "Healthy scrambled eggs loaded with sautéed spinach and garlic.",
        "instructions": "Sauté garlic in olive oil. Add spinach and wilt. Pour in beaten eggs and scramble until set. Season with salt.",
        "ingredients": [
            {"ingredient_name": "eggs", "quantity": 3, "unit": "whole"},
            {"ingredient_name": "spinach", "quantity": 2, "unit": "cups"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 1, "unit": "tbsp"},
            {"ingredient_name": "salt", "quantity": 0.25, "unit": "tsp"},
        ],
    },
    {
        "name": "Cheesy Baked Pasta",
        "description": "Comfort food pasta baked with tomato sauce and melted cheese.",
        "instructions": "Cook pasta. Mix with canned tomatoes, garlic, and olive oil. Top with cheese. Bake at 375°F for 20 minutes.",
        "ingredients": [
            {"ingredient_name": "pasta", "quantity": 200, "unit": "grams"},
            {"ingredient_name": "canned tomatoes", "quantity": 1, "unit": "can"},
            {"ingredient_name": "cheese", "quantity": 100, "unit": "grams"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 1, "unit": "tbsp"},
        ],
    },
    {
        "name": "Chicken and Rice Soup",
        "description": "Warming one-pot chicken soup with rice and vegetables.",
        "instructions": "Simmer chicken in broth with onion and garlic. Remove chicken, shred it. Add rice and cook until tender. Return chicken to pot and season.",
        "ingredients": [
            {"ingredient_name": "chicken", "quantity": 300, "unit": "grams"},
            {"ingredient_name": "rice", "quantity": 0.5, "unit": "cup"},
            {"ingredient_name": "chicken broth", "quantity": 4, "unit": "cups"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "garlic", "quantity": 2, "unit": "cloves"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
        ],
    },
    {
        "name": "Classic Pancakes",
        "description": "Fluffy breakfast pancakes made from pantry staples.",
        "instructions": "Mix flour, sugar, baking soda, eggs, milk, and melted butter. Cook on a greased pan over medium heat until bubbles form, then flip.",
        "ingredients": [
            {"ingredient_name": "flour", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "eggs", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "milk", "quantity": 0.75, "unit": "cup"},
            {"ingredient_name": "butter", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "sugar", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "baking soda", "quantity": 1, "unit": "tsp"},
        ],
    },
    {
        "name": "Tomato Basil Soup",
        "description": "Smooth and savory tomato soup with garlic and onion.",
        "instructions": "Sauté onion and garlic in olive oil. Add canned tomatoes and chicken broth. Simmer 15 minutes. Blend smooth and season with salt and pepper.",
        "ingredients": [
            {"ingredient_name": "canned tomatoes", "quantity": 2, "unit": "cans"},
            {"ingredient_name": "onion", "quantity": 1, "unit": "whole"},
            {"ingredient_name": "garlic", "quantity": 3, "unit": "cloves"},
            {"ingredient_name": "olive oil", "quantity": 2, "unit": "tbsp"},
            {"ingredient_name": "chicken broth", "quantity": 1, "unit": "cup"},
            {"ingredient_name": "salt", "quantity": 0.5, "unit": "tsp"},
            {"ingredient_name": "pepper", "quantity": 0.25, "unit": "tsp"},
        ],
    },
    {
        "name": "Garlic Butter Shrimp",
        "description": "Quick pan-seared shrimp in a rich garlic butter sauce.",
        "instructions": "Melt butter in a pan over medium-high heat. Add garlic and shrimp. Cook 2 minutes per side. Squeeze lemon over and serve.",
        "ingredients": [
            {"ingredient_name": "shrimp", "quantity": 300, "unit": "grams"},
            {"ingredient_name": "butter", "quantity": 3, "unit": "tbsp"},
            {"ingredient_name": "garlic", "quantity": 4, "unit": "cloves"},
            {"ingredient_name": "lemon", "quantity": 0.5, "unit": "whole"},
            {"ingredient_name": "salt", "quantity": 0.25, "unit": "tsp"},
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Recipe).count()
        if existing > 0:
            print(f"Database already has {existing} recipes. Skipping seed.")
            return

        for recipe_data in RECIPES:
            ingredients = recipe_data.pop("ingredients")
            recipe = models.Recipe(**recipe_data)
            db.add(recipe)
            db.flush()
            for ing in ingredients:
                db.add(models.RecipeIngredient(recipe_id=recipe.id, **ing))

        db.commit()
        print(f"Seeded {len(RECIPES)} recipes successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
