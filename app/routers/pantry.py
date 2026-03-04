from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

import app.models as models
from app.schemas.pantry import PantryItem as PantryItemSchema
from app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/pantry")


@router.get("/items")
def get_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    items = db.query(models.PantryItem).filter(
        models.PantryItem.user_id == current_user.id
    ).all()
    return {"items": items}


@router.get("/items/expiring-soon")
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


@router.get("/items/expired")
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


@router.get("/items/{item_id}")
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


@router.post("/items")
def add_item(
    item: PantryItemSchema,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_item = models.PantryItem(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"message": "Item added!", "item": db_item}


@router.delete("/items/{item_id}")
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


@router.put("/items/{item_id}")
def update_item(
    item_id: int,
    updated_item: PantryItemSchema,
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
