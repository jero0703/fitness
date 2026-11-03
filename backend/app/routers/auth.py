from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user with username, unique email address, and strong password.
    """
    return AuthService.register_user(db, user_data)

@router.post("/login", response_model=Token, summary="User login and JWT token retrieval")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user credentials and return a signed Bearer JWT access token.
    """
    user = AuthService.authenticate_user(db, credentials)
    return AuthService.create_token_for_user(user)

@router.get("/me", response_model=UserOut, summary="Get current logged in user details")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve profile details of the currently authenticated user.
    """
    return current_user
