from contextlib import asynccontextmanager

import sentry_sdk
import structlog
from sqlalchemy import text
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.router import api_router
from app.config import get_settings

settings = get_settings()

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() if settings.APP_ENV == "development" else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(0),
)

logger = structlog.get_logger()

if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.2, environment=settings.APP_ENV)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("app.startup", env=settings.APP_ENV)
    yield
    logger.info("app.shutdown")


app = FastAPI(
    title="Naviq API",
    description="AI-powered career orientation platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    from redis.asyncio import from_url

    from app.database import engine

    checks = {"api": "ok", "database": "ok", "redis": "ok"}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        checks["database"] = "error"

    try:
        r = from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
    except Exception:
        checks["redis"] = "error"

    healthy = all(v == "ok" for v in checks.values())
    return JSONResponse(content=checks, status_code=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE)


app.include_router(api_router)
