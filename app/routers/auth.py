from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import httpx
from app.database import get_db
from app.models import User, UserStats
from app.schemas import (
    UserCreate, User as UserSchema, UserLogin, Token,
    GoogleOAuthToken, GoogleUserInfo, CompleteProfile
)
from app.auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    get_current_active_user
)
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role="student"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login-form", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user with form data (for OAuth2 compatibility)"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


async def verify_google_token(token: str) -> GoogleUserInfo:
    """Verify Google ID token and return user info"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            data = response.json()
            
            # Verify the token is for our app
            if settings.google_client_id and data.get("aud") != settings.google_client_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token audience mismatch"
                )
            
            return GoogleUserInfo(
                email=data["email"],
                name=data.get("name", data.get("given_name", "User")),
                google_id=data["sub"],
                email_verified=data.get("email_verified", False)
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to verify Google token"
        )


@router.post("/google", response_model=dict)
async def google_oauth(
    token_data: GoogleOAuthToken,
    db: Session = Depends(get_db)
):
    """Login or register with Google OAuth"""
    # Verify Google token
    google_user = await verify_google_token(token_data.token)
    
    # Check if user exists by email or google_id
    db_user = db.query(User).filter(
        (User.email == google_user.email) | (User.google_id == google_user.google_id)
    ).first()
    
    if db_user:
        # User exists - login
        if not db_user.google_id:
            # Link Google account to existing user
            db_user.google_id = google_user.google_id
            db.commit()
            db.refresh(db_user)
        
        # Check if profile is complete
        # Profile needs completion if user doesn't have name or date_of_birth
        # (For Google users, password is optional)
        needs_completion = not db_user.name or not db_user.name.strip() or not db_user.date_of_birth
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "needs_completion": needs_completion,
            "user": UserSchema.model_validate(db_user)
        }
    else:
        # New user - create account with Google
        db_user = User(
            name=google_user.name,
            email=google_user.email,
            google_id=google_user.google_id,
            hashed_password=None,  # Will be set when completing profile
            role="student"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create user stats
        stats = UserStats(
            user_id=db_user.id,
            total_points=0,
            current_level=1,
            experience_points=0,
            experience_to_next_level=100,
            streak_days=0,
            simulations_completed=0,
            certificates_earned=0,
            assessments_completed=0
        )
        db.add(stats)
        db.commit()
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        
        # New Google user - always needs to complete profile (name and password)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "needs_completion": True,  # New Google user needs to complete profile
            "user": UserSchema.model_validate(db_user)
        }


@router.post("/complete-profile", response_model=UserSchema)
def complete_profile(
    profile_data: CompleteProfile,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Complete user profile with name and education info (for Google OAuth users)"""
    from datetime import datetime
    
    # Check if user needs to complete profile
    # Profile is considered complete if name is set
    if current_user.name and current_user.name.strip():
        # Allow updating profile even if already completed
        pass
    
    # Update user profile
    current_user.name = profile_data.name
    
    if profile_data.date_of_birth:
        current_user.date_of_birth = datetime.fromisoformat(profile_data.date_of_birth.replace('Z', '+00:00'))
    
    if profile_data.education_status:
        current_user.education_status = profile_data.education_status
    
    if profile_data.school_name:
        current_user.school_name = profile_data.school_name
    
    if profile_data.graduation_date:
        current_user.graduation_date = datetime.fromisoformat(profile_data.graduation_date.replace('Z', '+00:00'))
    
    # Update updated_at timestamp
    from datetime import datetime as dt
    current_user.updated_at = dt.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    # Return serialized user data
    return UserSchema.model_validate(current_user)
