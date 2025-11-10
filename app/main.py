from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, HTMLResponse
from app.config import settings
from app.database import engine, Base
from app.routers import auth, assessment, simulations, tracks, certificates, admin, gamification, new_front

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Naviq API",
    description="AI-powered career navigation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - должен быть первым
# Разрешаем все origins для production (можно ограничить позже)
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://62.72.20.193:7000",
    "http://62.72.20.193",

]

# Используем regex для более гибкой настройки (разрешаем любой IP/домен на порту 7000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(.*\.)?62\.72\.20\.193(:\d+)?|https?://(.*\.)?31\.148\.164\.107(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Явный обработчик OPTIONS для всех путей (на случай если middleware не сработает)
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle OPTIONS requests explicitly"""
    origin = request.headers.get("origin")
    # Если origin не указан, разрешаем все (но это не рекомендуется с credentials)
    if not origin:
        # Проверяем разрешенные origins
        allowed_origins = [
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
            "http://localhost:5173", "http://127.0.0.1:5173",
            "http://62.72.20.193:7000", "http://62.72.20.193",
            "https://62.72.20.193:7000", "https://62.72.20.193",
        ]
        # Если origin не указан, используем первый разрешенный (для тестирования)
        origin = allowed_origins[0] if allowed_origins else "*"
    
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        },
    )

# Include routers
app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(simulations.router)
app.include_router(tracks.router)
app.include_router(certificates.router)
app.include_router(admin.router)
app.include_router(gamification.router)
app.include_router(new_front.router)


@app.get("/", response_class=HTMLResponse)
def read_root():
    """Welcome page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Naviq - AI Career Navigation</title>
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #1A2238 0%, #7B61FF 100%);
                color: white;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 600px;
                padding: 2rem;
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, #7B61FF, #00D4FF);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            .links {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .link {
                background: rgba(255, 255, 255, 0.1);
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                text-decoration: none;
                color: white;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .link:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            .features {
                margin-top: 3rem;
                text-align: left;
            }
            .feature {
                margin: 1rem 0;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border-left: 4px solid #7B61FF;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Naviq</h1>
            <p class="subtitle">AI, который ведёт тебя к карьере</p>
            
            <div class="links">
                <a href="/docs" class="link">📚 API Documentation</a>
                <a href="/redoc" class="link">📖 ReDoc</a>
                <a href="http://localhost:3000" class="link">🎨 Frontend</a>
            </div>
            
            <div class="features">
                <div class="feature">
                    <strong>🧠 AI-профориентация</strong><br>
                    Персонализированный тест с рекомендациями на основе ИИ
                </div>
                <div class="feature">
                    <strong>🎯 Карьерные симуляции</strong><br>
                    Практические задания для разных профессий
                </div>
                <div class="feature">
                    <strong>📜 Сертификаты</strong><br>
                    Подтверждение прохождения с QR-кодом
                </div>
                <div class="feature">
                    <strong>📊 Аналитика</strong><br>
                    Отслеживание прогресса и достижений
                </div>
            </div>
        </div>
    </body>
    </html>
    """


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Naviq API is running",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
