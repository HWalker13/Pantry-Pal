from fastapi import FastAPI
from app.database import engine, Base
import app.models  # registers all models with Base.metadata before create_all
from app.routers import auth, pantry, recipes

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(pantry.router)
app.include_router(recipes.router)


@app.get("/")
def health():
    return {"message": "Pantry Pal API is running!"}
