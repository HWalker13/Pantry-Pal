from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

import app.models as models
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.dependencies import get_db, hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserOut, status_code=201)
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


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer"}
