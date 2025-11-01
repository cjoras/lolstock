from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    balance = Column(Float, default=10000.0)  # Startbeløp
    entra_id = Column(String, unique=True, index=True)

    holdings = relationship("Holding", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    summoner_name = Column(String, unique=True, index=True)
    tag_line = Column(String)
    puuid = Column(String, unique=True)
    summoner_id = Column(String, unique=True)
    current_rank = Column(String)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    last_updated = Column(DateTime)
    stock_price = Column(Float, default=1000.0)
    
    holdings = relationship("Holding", back_populates="player")
    transactions = relationship("Transaction", back_populates="player", cascade="all, delete-orphan")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    shares = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="holdings")
    player = relationship("Player", back_populates="holdings")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    shares = Column(Integer)
    transaction_type = Column(String)  # BUY / SELL
    price = Column(Float)
    timestamp = Column(DateTime)

    user = relationship("User", back_populates="transactions")
    player = relationship("Player", back_populates="transactions")


class MarketHistory(Base):
    __tablename__ = "market_history"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", backref="market_history")