"""
SQLAlchemy models for the SQL Injection Learning Lab.
Fictional RedCorp / CyberCorp simulated database schema.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(32), default="analyst")
    email = Column(String(128), unique=True, nullable=False)
    pin = Column(String(8), default="7492")  # For blind injection challenge
    is_active = Column(Boolean, default=True)
    notes = Column(Text, default="Standard security cleared employee.")


class SecretCredential(Base):
    __tablename__ = "secret_credentials"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(64), nullable=False)
    access_key = Column(String(64), nullable=False)
    secret_token = Column(String(128), nullable=False)
    classification = Column(String(32), default="TOP_SECRET_RED")
    flag_value = Column(String(64), nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(32), unique=True, index=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text)
    price = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)  # Unlisted items revealed via injection


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String(32), unique=True, index=True)
    full_name = Column(String(128), nullable=False)
    department = Column(String(64), nullable=False)
    clearance_level = Column(String(32), default="Level-1")
    phone = Column(String(32))
    internal_email = Column(String(128))


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(32), unique=True, index=True)
    customer_id = Column(Integer)
    product_name = Column(String(128))
    quantity = Column(Integer, default=1)
    status = Column(String(32), default="PENDING")
    diagnostic_info = Column(Text)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    author = Column(String(64))
    subject = Column(String(128))
    comments = Column(Text)
    sentiment = Column(String(32), default="NEUTRAL")
    created_at = Column(DateTime, default=datetime.utcnow)


class ChallengeProgress(Base):
    __tablename__ = "challenge_progress"

    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(String(32), unique=True, index=True)
    title = Column(String(128))
    category = Column(String(64))
    difficulty = Column(String(32))
    completed = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    flag = Column(String(64))
    completed_at = Column(DateTime, nullable=True)


class WafRuleRecord(Base):
    __tablename__ = "waf_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(32), unique=True, index=True)
    name = Column(String(128))
    category = Column(String(64))
    pattern = Column(Text)
    description = Column(Text)
    severity = Column(String(32), default="HIGH")
    is_enabled = Column(Boolean, default=True)
    trigger_count = Column(Integer, default=0)

