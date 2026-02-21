from sqlalchemy import Column, Integer, String, Date
from database import Base


class PantryItem(Base):
    __tablename__ = "pantry_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    expiration_date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
