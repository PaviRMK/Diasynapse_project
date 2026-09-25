import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, Field

from app.firebase_config import db

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET", "diasynapse_super_secure_jwt_secret_key_2026_clinical_ai")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


# --- Password Helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


# --- JWT Helpers ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- Dependency for Authenticated Requests ---
def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = decode_access_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_doc = db.collection("users").document(email.lower()).get()
    if not user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = user_doc.to_dict()
    # Strip sensitive security credentials before propagating
    user_data.pop("password_hash", None)
    return user_data


# --- Pydantic Schemas ---
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(...)
    password: str = Field(..., min_length=6)
    diabetesType: str = Field(default="Type 1")
    dob: str = Field(...)


class LoginRequest(BaseModel):
    email: str = Field(...)
    password: str = Field(...)


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    diabetesType: Optional[str] = None
    dob: Optional[str] = None


# --- Endpoints ---
@auth_router.post("/register")
def register(data: RegisterRequest):
    email_clean = data.email.strip().lower()
    if not EMAIL_REGEX.match(email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address.",
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    user_ref = db.collection("users").document(email_clean)
    existing_user = user_ref.get()
    if existing_user.exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    uid = str(uuid.uuid4())
    pw_hash = hash_password(data.password)

    user_record = {
        "uid": uid,
        "email": email_clean,
        "name": data.name.strip(),
        "password_hash": pw_hash,
        "diabetesType": data.diabetesType,
        "dob": data.dob,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    user_ref.set(user_record)

    token = create_access_token(data={"sub": email_clean, "uid": uid})

    safe_user = {
        "uid": uid,
        "email": email_clean,
        "name": data.name.strip(),
        "diabetesType": data.diabetesType,
        "dob": data.dob,
    }

    return {
        "token": token,
        "user": safe_user,
        "message": "Registration successful.",
    }


@auth_router.post("/login")
def login(data: LoginRequest):
    email_clean = data.email.strip().lower()
    if not email_clean or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    user_ref = db.collection("users").document(email_clean)
    user_doc = user_ref.get()

    if not user_doc.exists:
        # Uniform error message to prevent account enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_data = user_doc.to_dict()
    stored_hash = user_data.get("password_hash", "")

    if not verify_password(data.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(data={"sub": email_clean, "uid": user_data.get("uid")})

    safe_user = {
        "uid": user_data.get("uid"),
        "email": email_clean,
        "name": user_data.get("name"),
        "diabetesType": user_data.get("diabetesType", "Type 1"),
        "dob": user_data.get("dob", ""),
    }

    return {
        "token": token,
        "user": safe_user,
        "message": "Login successful.",
    }


@auth_router.get("/me")
def get_current_authenticated_user(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "uid": current_user.get("uid"),
            "email": current_user.get("email"),
            "name": current_user.get("name"),
            "diabetesType": current_user.get("diabetesType", "Type 1"),
            "dob": current_user.get("dob", ""),
        }
    }


@auth_router.put("/profile")
def update_user_profile(
    updates: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    email = current_user["email"]
    user_ref = db.collection("users").document(email)

    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if updates.name is not None and updates.name.strip():
        update_fields["name"] = updates.name.strip()
    if updates.diabetesType is not None:
        update_fields["diabetesType"] = updates.diabetesType
    if updates.dob is not None:
        update_fields["dob"] = updates.dob

    user_ref.update(update_fields)

    refreshed = user_ref.get().to_dict()
    safe_user = {
        "uid": refreshed.get("uid"),
        "email": email,
        "name": refreshed.get("name"),
        "diabetesType": refreshed.get("diabetesType", "Type 1"),
        "dob": refreshed.get("dob", ""),
    }

    return {
        "user": safe_user,
        "message": "Profile updated successfully.",
    }
