import logging
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.base import Base

logger = logging.getLogger(__name__)

def create_db_engine():
    if os.environ.get("TESTING") == "1":
        return create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

    database_url = settings.DATABASE_URL
    is_sqlite = database_url.startswith("sqlite")
    
    if not is_sqlite:
        try:
            # Attempt to connect to MySQL with a short timeout to prevent startup hangs
            eng = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 2}
            )
            with eng.connect():
                pass
            logger.info("Successfully connected to MySQL database: %s", settings.MYSQL_DATABASE)
            return eng
        except Exception as e:
            if settings.AUTO_SQLITE_FALLBACK:
                logger.warning(
                    "MySQL connection failed (%s). Falling back to SQLite for local development: sqlite:///./fittrack.db",
                    str(e)
                )
                sqlite_url = "sqlite:///./fittrack.db"
                return create_engine(sqlite_url, connect_args={"check_same_thread": False})
            else:
                logger.error("Could not connect to MySQL database at %s: %s", database_url, str(e))
                raise e
    else:
        return create_engine(database_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import all models to ensure they are registered with Base.metadata
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
