from pathlib import Path
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, CareerTrack, Simulation, User, Achievement
from app.auth import get_password_hash
from app.data_loader import load_realistic_simulations
# Create all tables
Base.metadata.create_all(bind=engine)


def init_db():
    """Initialize database with sample data"""
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = db.query(User).filter(User.email == "admin@naviq.com").first()
        if not admin_user:
            admin_user = User(
                name="Admin User",
                email="admin@naviq.com",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
        
        # Create sample career tracks
        tracks_data = [
            {
                "name": "Frontend Developer",
                "description": "Разработка пользовательских интерфейсов с использованием современных технологий",
                "category": "development",
                "skills_required": ["HTML", "CSS", "JavaScript", "React", "TypeScript"],
                "average_salary": "80,000 - 120,000 руб",
                "growth_prospects": "Высокий спрос на рынке, множество вакансий"
            },
            {
                "name": "Backend Developer",
                "description": "Серверная разработка и создание API",
                "category": "development",
                "skills_required": ["Python", "Django", "FastAPI", "PostgreSQL", "Docker"],
                "average_salary": "90,000 - 140,000 руб",
                "growth_prospects": "Стабильный рост, высокие зарплаты"
            },
            {
                "name": "Data Analyst",
                "description": "Анализ данных и создание отчетов для бизнеса",
                "category": "data",
                "skills_required": ["Python", "SQL", "Pandas", "Tableau", "Statistics"],
                "average_salary": "70,000 - 110,000 руб",
                "growth_prospects": "Растущий спрос в различных отраслях"
            },
            {
                "name": "UI/UX Designer",
                "description": "Дизайн пользовательских интерфейсов и опыта взаимодействия",
                "category": "design",
                "skills_required": ["Figma", "Adobe XD", "Sketch", "User Research", "Prototyping"],
                "average_salary": "60,000 - 100,000 руб",
                "growth_prospects": "Креативная работа, высокий спрос"
            },
            {
                "name": "Product Manager",
                "description": "Управление продуктом и координация команд",
                "category": "management",
                "skills_required": ["Product Strategy", "Analytics", "Communication", "Leadership"],
                "average_salary": "100,000 - 150,000 руб",
                "growth_prospects": "Высокие позиции, карьерный рост"
            },
            {
                "name": "Digital Marketing Specialist",
                "description": "Продвижение продуктов в цифровой среде",
                "category": "marketing",
                "skills_required": ["Google Ads", "Facebook Ads", "Analytics", "Content Marketing"],
                "average_salary": "50,000 - 90,000 руб",
                "growth_prospects": "Развивающаяся область, много возможностей"
            }
        ]
        
        for track_data in tracks_data:
            existing_track = db.query(CareerTrack).filter(
                CareerTrack.name == track_data["name"]
            ).first()
            
            if not existing_track:
                track = CareerTrack(**track_data)
                db.add(track)
        
        db.commit()
        
        # Create sample simulations
        simulations_data = [
            {
                "title": "Создание лендинга для стартапа",
                "description": "Создайте современный лендинг для IT-стартапа с использованием HTML, CSS и JavaScript",
                "track_id": 1,  # Frontend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Анализ требований",
                        "description": "Изучите техническое задание и определите структуру сайта",
                        "type": "analysis",
                        "content": {
                            "task": "Проанализируйте требования к лендингу",
                            "requirements": [
                                "Главная страница с призывом к действию",
                                "Секция о продукте",
                                "Контакты и форма обратной связи"
                            ],
                            "examples": [
                                {
                                    "title": "Структура анализа требований",
                                    "content": "1. Выделите ключевые разделы сайта\n2. Определите цели каждой секции\n3. Продумайте навигацию между разделами\n4. Учтите целевую аудиторию\n5. Определите приоритеты контента"
                                },
                                {
                                    "title": "Пример структуры лендинга",
                                    "content": "Структура:\n- Header (логотип, меню, CTA кнопка)\n- Hero секция (заголовок, описание, главная CTA)\n- О продукте (особенности, преимущества)\n- Отзывы/кейсы\n- Контакты/форма\n- Footer (ссылки, копирайт)"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Создание HTML структуры",
                        "description": "Создайте семантическую HTML разметку",
                        "type": "task",
                        "content": {
                            "task": "Создайте HTML файл с правильной структурой",
                            "hints": ["Используйте семантические теги", "Добавьте мета-теги"],
                            "examples": [
                                {
                                    "title": "Пример базовой HTML структуры",
                                    "code": "<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Мой Лендинг</title>\n</head>\n<body>\n    <header>\n        <nav>\n            <ul>\n                <li><a href=\"#home\">Главная</a></li>\n                <li><a href=\"#about\">О нас</a></li>\n            </ul>\n        </nav>\n    </header>\n    <main>\n        <section id=\"home\">\n            <h1>Добро пожаловать!</h1>\n            <p>Описание продукта</p>\n        </section>\n    </main>\n    <footer>\n        <p>&copy; 2024 Компания</p>\n    </footer>\n</body>\n</html>"
                                },
                                {
                                    "title": "Семантические теги",
                                    "content": "Используйте: <header>, <nav>, <main>, <section>, <article>, <footer>\nИзбегайте: <div> для основных структурных элементов"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Стилизация с CSS",
                        "description": "Примените современные стили и сделайте адаптивный дизайн",
                        "type": "task",
                        "content": {
                            "task": "Создайте CSS файл с современными стилями",
                            "requirements": ["Адаптивный дизайн", "Современная типографика", "Цветовая схема"],
                            "examples": [
                                {
                                    "title": "Пример адаптивного CSS",
                                    "code": "/* Базовые стили */\nbody {\n    font-family: 'Inter', sans-serif;\n    margin: 0;\n    padding: 0;\n    line-height: 1.6;\n}\n\n/* Адаптивный контейнер */\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 0 20px;\n}\n\n/* Media queries для мобильных */\n@media (max-width: 768px) {\n    .container {\n        padding: 0 15px;\n    }\n    h1 {\n        font-size: 2rem;\n    }\n}"
                                },
                                {
                                    "title": "Flexbox для макета",
                                    "code": ".header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 1rem 0;\n}\n\n.flex-container {\n    display: flex;\n    gap: 2rem;\n    flex-wrap: wrap;\n}"
                                }
                            ]
                        }
                    }
                ],
                "duration": "45-60 минут",
                "level": "beginner"
            },
            {
                "title": "API для интернет-магазина",
                "description": "Создайте REST API для управления товарами в интернет-магазине",
                "track_id": 2,  # Backend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Проектирование API",
                        "description": "Спроектируйте структуру API и модели данных",
                        "type": "analysis",
                        "content": {
                            "task": "Определите эндпоинты и модели данных",
                            "endpoints": ["GET /products", "POST /products", "PUT /products/{id}", "DELETE /products/{id}"],
                            "examples": [
                                {
                                    "title": "Структура REST API",
                                    "content": "REST API следует принципам:\n1. Используйте HTTP методы (GET, POST, PUT, DELETE)\n2. Ресурсы в URL (/products, /users)\n3. Статус коды для ответов (200, 201, 404, 500)\n4. JSON для передачи данных"
                                },
                                {
                                    "title": "Пример структуры API для товаров",
                                    "code": "# Структура эндпоинтов\nGET    /products          # Список всех товаров\nGET    /products/{id}     # Получить товар по ID\nPOST   /products          # Создать новый товар\nPUT    /products/{id}     # Обновить товар\nDELETE /products/{id}     # Удалить товар\n\n# Модель данных Product\n{\n  \"id\": 1,\n  \"name\": \"Ноутбук\",\n  \"price\": 50000,\n  \"description\": \"Описание товара\",\n  \"category\": \"Электроника\"\n}"
                                },
                                {
                                    "title": "Best practices",
                                    "content": "✅ Используйте множественное число для ресурсов (/products)\n✅ Версионируйте API (/api/v1/products)\n✅ Используйте статус коды правильно\n✅ Обрабатывайте ошибки единообразно\n✅ Документируйте API"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Создание моделей",
                        "description": "Создайте модели данных для товаров",
                        "type": "task",
                        "content": {
                            "task": "Создайте модель Product с полями: name, price, description, category",
                            "hints": ["Используйте SQLAlchemy", "Добавьте валидацию"],
                            "examples": [
                                {
                                    "title": "Пример SQLAlchemy модели",
                                    "code": "from sqlalchemy import Column, Integer, String, Float, DateTime\nfrom sqlalchemy.ext.declarative import declarative_base\nfrom datetime import datetime\n\nBase = declarative_base()\n\nclass Product(Base):\n    __tablename__ = \"products\"\n    \n    id = Column(Integer, primary_key=True, index=True)\n    name = Column(String(100), nullable=False)\n    price = Column(Float, nullable=False)\n    description = Column(String(500))\n    category = Column(String(50))\n    created_at = Column(DateTime, default=datetime.utcnow)\n    \n    def __repr__(self):\n        return f\"<Product(name='{self.name}', price={self.price})>\""
                                },
                                {
                                    "title": "Pydantic схема для валидации",
                                    "code": "from pydantic import BaseModel, Field\nfrom typing import Optional\n\nclass ProductCreate(BaseModel):\n    name: str = Field(..., min_length=1, max_length=100)\n    price: float = Field(..., gt=0)\n    description: Optional[str] = None\n    category: str\n    \nclass ProductResponse(BaseModel):\n    id: int\n    name: str\n    price: float\n    category: str\n    \n    class Config:\n        from_attributes = True"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Реализация CRUD операций",
                        "description": "Реализуйте все CRUD операции для товаров",
                        "type": "task",
                        "content": {
                            "task": "Создайте эндпоинты для всех операций с товарами",
                            "requirements": ["Валидация данных", "Обработка ошибок", "Документация API"],
                            "examples": [
                                {
                                    "title": "Пример FastAPI CRUD",
                                    "code": "from fastapi import FastAPI, HTTPException, Depends\nfrom sqlalchemy.orm import Session\nfrom typing import List\n\napp = FastAPI()\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\n@app.post(\"/products/\", response_model=ProductResponse)\nasync def create_product(product: ProductCreate, db: Session = Depends(get_db)):\n    db_product = Product(**product.dict())\n    db.add(db_product)\n    db.commit()\n    db.refresh(db_product)\n    return db_product\n\n@app.get(\"/products/\", response_model=List[ProductResponse])\nasync def get_products(db: Session = Depends(get_db)):\n    return db.query(Product).all()\n\n@app.get(\"/products/{product_id}\", response_model=ProductResponse)\nasync def get_product(product_id: int, db: Session = Depends(get_db)):\n    product = db.query(Product).filter(Product.id == product_id).first()\n    if not product:\n        raise HTTPException(status_code=404, detail=\"Product not found\")\n    return product"
                                }
                            ]
                        }
                    }
                ],
                "duration": "60-90 минут",
                "level": "intermediate"
            },
            {
                "title": "Анализ продаж компании",
                "description": "Проанализируйте данные о продажах и создайте отчет с выводами",
                "track_id": 3,  # Data Analyst
                "steps": [
                    {
                        "id": 1,
                        "title": "Исследование данных",
                        "description": "Изучите структуру данных и выявите основные метрики",
                        "type": "analysis",
                        "content": {
                            "task": "Проанализируйте предоставленный датасет",
                            "data_columns": ["date", "product", "sales", "region", "customer_type"],
                            "examples": [
                                {
                                    "title": "Пример исследования данных",
                                    "code": "import pandas as pd\n\n# Загрузка данных\ndf = pd.read_csv('sales.csv')\n\n# Базовая информация\ndf.info()\ndf.describe()\n\n# Проверка пропусков\ndf.isnull().sum()\n\n# Уникальные значения\nprint('Товары:', df['product'].unique())\nprint('Регионы:', df['region'].unique())\n\n# Группировка по категориям\ndf.groupby('region')['sales'].sum()"
                                },
                                {
                                    "title": "Ключевые метрики для анализа",
                                    "content": "1. Общий объем продаж\n2. Продажи по регионам\n3. Топ товары\n4. Динамика продаж по времени\n5. Сегментация клиентов"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Очистка данных",
                        "description": "Очистите данные от выбросов и пропусков",
                        "type": "task",
                        "content": {
                            "task": "Очистите данные и подготовьте их к анализу",
                            "steps": ["Удаление дубликатов", "Обработка пропусков", "Проверка выбросов"],
                            "examples": [
                                {
                                    "title": "Пример очистки данных с Pandas",
                                    "code": "import pandas as pd\nimport numpy as np\n\n# Загрузка данных\ndf = pd.read_csv('sales.csv')\n\n# Удаление дубликатов\ndf = df.drop_duplicates()\n\n# Обработка пропусков\ndf['sales'].fillna(df['sales'].mean(), inplace=True)\ndf = df.dropna(subset=['product'])\n\n# Удаление выбросов (используя IQR метод)\nQ1 = df['sales'].quantile(0.25)\nQ3 = df['sales'].quantile(0.75)\nIQR = Q3 - Q1\ndf = df[(df['sales'] >= Q1 - 1.5*IQR) & (df['sales'] <= Q3 + 1.5*IQR)]\n\nprint(f'Очищено записей: {len(df)}')"
                                },
                                {
                                    "title": "Проверка качества данных",
                                    "code": "# Проверка типов данных\nprint(df.dtypes)\n\n# Проверка пропусков\nprint(df.isnull().sum())\n\n# Базовая статистика\ndf.describe()"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Создание отчета",
                        "description": "Создайте визуализации и выводы по анализу",
                        "type": "presentation",
                        "content": {
                            "task": "Создайте отчет с графиками и выводами",
                            "requirements": ["Графики продаж по времени", "Топ товары", "Анализ по регионам"],
                            "examples": [
                                {
                                    "title": "Пример визуализации с Matplotlib",
                                    "code": "import matplotlib.pyplot as plt\nimport pandas as pd\n\n# График продаж по времени\ndf['date'] = pd.to_datetime(df['date'])\ndf_time = df.groupby('date')['sales'].sum()\nplt.figure(figsize=(12, 6))\nplt.plot(df_time.index, df_time.values)\nplt.title('Динамика продаж')\nplt.xlabel('Дата')\nplt.ylabel('Продажи')\nplt.show()\n\n# Топ товары\nplt.figure(figsize=(10, 6))\ntop_products = df.groupby('product')['sales'].sum().sort_values(ascending=False).head(5)\nplt.barh(top_products.index, top_products.values)\nplt.title('Топ 5 товаров по продажам')\nplt.xlabel('Продажи')\nplt.show()"
                                },
                                {
                                    "title": "Структура отчета",
                                    "content": "1. Введение (цель анализа, описание данных)\n2. Основные находки (ключевые метрики)\n3. Визуализации (графики, таблицы)\n4. Выводы и рекомендации\n5. Приложения (детальные данные)"
                                }
                            ]
                        }
                    }
                ],
                "duration": "60-75 минут",
                "level": "beginner"
            },
            {
                "title": "React приложение с хуками",
                "description": "Создайте современное React приложение с использованием хуков и управлением состоянием",
                "track_id": 1,  # Frontend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Настройка проекта",
                        "description": "Создайте новый React проект и настройте окружение",
                        "type": "task",
                        "content": {
                            "task": "Создайте React приложение с помощью Create React App или Vite",
                            "hints": ["Используйте TypeScript", "Настройте ESLint и Prettier"],
                            "examples": [
                                {
                                    "title": "Создание проекта с Vite",
                                    "code": "# Создание проекта\nnpm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install\n\n# Запуск dev сервера\nnpm run dev"
                                },
                                {
                                    "title": "Настройка tsconfig.json",
                                    "code": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n    \"strict\": true,\n    \"jsx\": \"react-jsx\"\n  }\n}"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Реализация компонентов",
                        "description": "Создайте функциональные компоненты с хуками",
                        "type": "task",
                        "content": {
                            "task": "Используйте useState и useEffect для управления состоянием",
                            "requirements": ["Компоненты с хуками", "Обработка событий", "Условный рендеринг"],
                            "examples": [
                                {
                                    "title": "Пример компонента с useState",
                                    "code": "import React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const [isVisible, setIsVisible] = useState(true);\n  \n  const increment = () => setCount(count + 1);\n  const toggle = () => setIsVisible(!isVisible);\n  \n  return (\n    <div>\n      {isVisible && <p>Счет: {count}</p>}\n      <button onClick={increment}>Увеличить</button>\n      <button onClick={toggle}>Переключить</button>\n    </div>\n  );\n}\n\nexport default Counter;"
                                },
                                {
                                    "title": "Пример с useEffect",
                                    "code": "import React, { useState, useEffect } from 'react';\n\nfunction DataFetcher() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    fetch('/api/data')\n      .then(res => res.json())\n      .then(data => {\n        setData(data);\n        setLoading(false);\n      });\n  }, []); // Пустой массив = выполнится один раз\n  \n  if (loading) return <div>Загрузка...</div>;\n  return <div>{JSON.stringify(data)}</div>;\n}"
                                }
                            ]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "intermediate"
            },
            {
                "title": "База данных и миграции",
                "description": "Настройте базу данных PostgreSQL и создайте систему миграций",
                "track_id": 2,  # Backend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Настройка БД",
                        "description": "Настройте подключение к PostgreSQL",
                        "type": "task",
                        "content": {
                            "task": "Создайте подключение к базе данных",
                            "requirements": ["Connection pooling", "Environment variables"],
                            "examples": [
                                {
                                    "title": "Пример подключения с SQLAlchemy",
                                    "code": "from sqlalchemy import create_engine\nfrom sqlalchemy.orm import sessionmaker\nimport os\n\n# Использование переменных окружения\nDATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/dbname')\n\n# Создание движка с connection pooling\nengine = create_engine(\n    DATABASE_URL,\n    pool_size=10,\n    max_overflow=20,\n    pool_pre_ping=True\n)\n\nSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()"
                                },
                                {
                                    "title": "Переменные окружения (.env)",
                                    "code": "DATABASE_URL=postgresql://user:password@localhost:5432/mydb\nDB_HOST=localhost\nDB_PORT=5432\nDB_USER=myuser\nDB_PASSWORD=mypassword\nDB_NAME=mydb"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Миграции",
                        "description": "Создайте систему миграций для схемы БД",
                        "type": "task",
                        "content": {
                            "task": "Реализуйте миграции для создания и изменения таблиц",
                            "hints": ["Используйте Alembic", "Версионирование схемы"],
                            "examples": [
                                {
                                    "title": "Инициализация Alembic",
                                    "code": "# Установка\npip install alembic\n\n# Инициализация\nalembic init alembic\n\n# Настройка alembic.ini и env.py\n# Добавьте Base и импорт моделей в env.py"
                                },
                                {
                                    "title": "Создание миграции",
                                    "code": "# Создать новую миграцию\nalembic revision --autogenerate -m \"Create products table\"\n\n# Применить миграцию\nalembic upgrade head\n\n# Откатить последнюю миграцию\nalembic downgrade -1"
                                },
                                {
                                    "title": "Пример миграции",
                                    "code": "def upgrade():\n    op.create_table(\n        'products',\n        sa.Column('id', sa.Integer(), nullable=False),\n        sa.Column('name', sa.String(100), nullable=False),\n        sa.Column('price', sa.Float(), nullable=False),\n        sa.PrimaryKeyConstraint('id')\n    )\n\ndef downgrade():\n    op.drop_table('products')"
                                }
                            ]
                        }
                    }
                ],
                "duration": "45-60 минут",
                "level": "beginner"
            },
            {
                "title": "Проектирование пользовательского опыта",
                "description": "Создайте wireframes и прототипы для мобильного приложения",
                "track_id": 4,  # UI/UX Designer
                "steps": [
                    {
                        "id": 1,
                        "title": "Исследование пользователей",
                        "description": "Проведите исследование целевой аудитории",
                        "type": "analysis",
                        "content": {
                            "task": "Создайте user personas и user journey maps",
                            "requirements": ["Интервью с пользователями", "Анализ конкурентов"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Wireframing",
                        "description": "Создайте wireframes основных экранов",
                        "type": "task",
                        "content": {
                            "task": "Создайте wireframes в Figma",
                            "requirements": ["Основные экраны", "Навигация", "Информационная архитектура"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Прототипирование",
                        "description": "Создайте интерактивный прототип",
                        "type": "task",
                        "content": {
                            "task": "Создайте кликабельный прототип",
                            "requirements": ["Интерактивность", "Анимации переходов", "Тестирование с пользователями"]
                        }
                    }
                ],
                "duration": "120-150 минут",
                "level": "intermediate"
            },
            {
                "title": "Анализ метрик продукта",
                "description": "Проанализируйте ключевые метрики продукта и предложите улучшения",
                "track_id": 5,  # Product Manager
                "steps": [
                    {
                        "id": 1,
                        "title": "Определение метрик",
                        "description": "Определите ключевые метрики продукта",
                        "type": "analysis",
                        "content": {
                            "task": "Выберите метрики для отслеживания",
                            "requirements": ["DAU/MAU", "Retention rate", "Conversion rate", "Churn rate"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Анализ данных",
                        "description": "Проанализируйте текущие показатели",
                        "type": "task",
                        "content": {
                            "task": "Создайте дашборд с метриками",
                            "requirements": ["Визуализация", "Тренды", "Сегментация"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Рекомендации",
                        "description": "Предложите план улучшений",
                        "type": "presentation",
                        "content": {
                            "task": "Создайте презентацию с рекомендациями",
                            "requirements": ["Приоритизация", "Roadmap", "KPI для улучшений"]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "advanced"
            },
            {
                "title": "Кампания в социальных сетях",
                "description": "Создайте и запустите рекламную кампанию в Facebook и Instagram",
                "track_id": 6,  # Digital Marketing
                "steps": [
                    {
                        "id": 1,
                        "title": "Планирование кампании",
                        "description": "Определите цели и целевую аудиторию",
                        "type": "analysis",
                        "content": {
                            "task": "Создайте план кампании",
                            "requirements": ["Цели", "Бюджет", "Целевая аудитория", "Креативы"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Создание объявлений",
                        "description": "Создайте креативы для рекламы",
                        "type": "task",
                        "content": {
                            "task": "Создайте объявления в Facebook Ads Manager",
                            "requirements": ["Изображения", "Тексты", "CTA", "A/B тестирование"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Запуск и оптимизация",
                        "description": "Запустите кампанию и оптимизируйте ее",
                        "type": "task",
                        "content": {
                            "task": "Запустите кампанию и отслеживайте метрики",
                            "requirements": ["Мониторинг", "Оптимизация ставок", "Анализ результатов"]
                        }
                    }
                ],
                "duration": "75-90 минут",
                "level": "beginner"
            },
            {
                "title": "Machine Learning модель для прогнозирования",
                "description": "Создайте модель машинного обучения для прогнозирования продаж",
                "track_id": 3,  # Data Analyst
                "steps": [
                    {
                        "id": 1,
                        "title": "Подготовка данных",
                        "description": "Подготовьте данные для обучения модели",
                        "type": "task",
                        "content": {
                            "task": "Загрузите и очистите данные",
                            "requirements": ["Feature engineering", "Нормализация", "Разделение на train/test"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Обучение модели",
                        "description": "Обучите модель машинного обучения",
                        "type": "task",
                        "content": {
                            "task": "Создайте и обучите модель",
                            "hints": ["Используйте scikit-learn", "Попробуйте разные алгоритмы", "Кросс-валидация"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Оценка и улучшение",
                        "description": "Оцените качество модели и улучшите ее",
                        "type": "presentation",
                        "content": {
                            "task": "Оцените метрики и оптимизируйте модель",
                            "requirements": ["MSE, MAE, R²", "Гиперпараметры", "Документация"]
                        }
                    }
                ],
                "duration": "120-180 минут",
                "level": "advanced"
            },
            {
                "title": "Микросервисная архитектура",
                "description": "Разработайте систему на основе микросервисной архитектуры",
                "track_id": 2,  # Backend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Проектирование архитектуры",
                        "description": "Спроектируйте архитектуру микросервисов",
                        "type": "analysis",
                        "content": {
                            "task": "Определите сервисы и их взаимодействие",
                            "requirements": ["Разделение на сервисы", "API Gateway", "Коммуникация между сервисами"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Реализация сервисов",
                        "description": "Реализуйте основные микросервисы",
                        "type": "task",
                        "content": {
                            "task": "Создайте несколько микросервисов",
                            "requirements": ["REST API", "Docker контейнеризация", "База данных на сервис"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Оркестрация",
                        "description": "Настройте оркестрацию и мониторинг",
                        "type": "task",
                        "content": {
                            "task": "Настройте Docker Compose или Kubernetes",
                            "requirements": ["Service discovery", "Логирование", "Мониторинг"]
                        }
                    }
                ],
                "duration": "180-240 минут",
                "level": "advanced"
            },
            {
                "title": "Vue.js SPA приложение",
                "description": "Создайте одностраничное приложение на Vue.js с роутингом и состоянием",
                "track_id": 1,  # Frontend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Настройка Vue проекта",
                        "description": "Создайте Vue 3 проект с TypeScript",
                        "type": "task",
                        "content": {
                            "task": "Инициализируйте проект Vue с помощью Vite",
                            "requirements": ["Vue 3", "TypeScript", "Vue Router", "Pinia для state management"],
                            "examples": [
                                {
                                    "title": "Создание Vue проекта",
                                    "code": "npm create vue@latest my-app\n# Выберите: TypeScript, Router, Pinia\ncd my-app\nnpm install"
                                },
                                {
                                    "title": "Базовая структура компонента",
                                    "code": "<script setup lang=\"ts\">\nimport { ref } from 'vue'\n\nconst count = ref(0)\n\nfunction increment() {\n  count.value++\n}\n</script>\n\n<template>\n  <button @click=\"increment\">\n    Count is: {{ count }}\n  </button>\n</template>"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Компоненты и роутинг",
                        "description": "Создайте основные компоненты и настройте роутинг",
                        "type": "task",
                        "content": {
                            "task": "Реализуйте несколько страниц и навигацию",
                            "requirements": ["Header и Footer компоненты", "Роуты для главной и детальных страниц", "Динамические роуты"],
                            "examples": [
                                {
                                    "title": "Настройка роутера",
                                    "code": "import { createRouter, createWebHistory } from 'vue-router'\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n    {\n      path: '/',\n      name: 'home',\n      component: () => import('../views/HomeView.vue')\n    },\n    {\n      path: '/products/:id',\n      name: 'product',\n      component: () => import('../views/ProductView.vue')\n    }\n  ]\n})"
                                },
                                {
                                    "title": "Использование роутера",
                                    "code": "<script setup>\nimport { useRouter } from 'vue-router'\n\nconst router = useRouter()\n\nfunction goToProduct(id) {\n  router.push({ name: 'product', params: { id } })\n}\n</script>"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Интеграция API",
                        "description": "Подключите API для загрузки данных",
                        "type": "task",
                        "content": {
                            "task": "Используйте axios для запросов к API",
                            "requirements": ["Обработка загрузки", "Обработка ошибок", "Кэширование данных"],
                            "examples": [
                                {
                                    "title": "Настройка axios",
                                    "code": "import axios from 'axios'\n\nconst api = axios.create({\n  baseURL: 'https://api.example.com',\n  timeout: 5000,\n  headers: {\n    'Content-Type': 'application/json'\n  }\n})\n\n// Interceptors для обработки ошибок\napi.interceptors.response.use(\n  response => response,\n  error => {\n    console.error('API Error:', error)\n    return Promise.reject(error)\n  }\n)"
                                },
                                {
                                    "title": "Использование в компоненте",
                                    "code": "<script setup>\nimport { ref, onMounted } from 'vue'\nimport api from '@/services/api'\n\nconst data = ref(null)\nconst loading = ref(true)\nconst error = ref(null)\n\nonMounted(async () => {\n  try {\n    const response = await api.get('/products')\n    data.value = response.data\n  } catch (err) {\n    error.value = err.message\n  } finally {\n    loading.value = false\n  }\n})\n</script>"
                                }
                            ]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "intermediate"
            },
            {
                "title": "Авторизация и безопасность API",
                "description": "Реализуйте систему аутентификации и авторизации с JWT токенами",
                "track_id": 2,  # Backend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Модель пользователя",
                        "description": "Создайте модель пользователя с хешированием паролей",
                        "type": "task",
                        "content": {
                            "task": "Реализуйте модель User с bcrypt для паролей",
                            "requirements": ["Хеширование паролей", "Валидация email", "Роли пользователей"],
                            "examples": [
                                {
                                    "title": "Модель User с SQLAlchemy",
                                    "code": "from sqlalchemy import Column, Integer, String, Boolean\nfrom werkzeug.security import generate_password_hash, check_password_hash\n\nclass User(Base):\n    __tablename__ = 'users'\n    \n    id = Column(Integer, primary_key=True)\n    email = Column(String(255), unique=True, nullable=False)\n    hashed_password = Column(String(255), nullable=False)\n    role = Column(String(20), default='user')\n    is_active = Column(Boolean, default=True)\n    \n    def set_password(self, password):\n        self.hashed_password = generate_password_hash(password)\n    \n    def check_password(self, password):\n        return check_password_hash(self.hashed_password, password)"
                                },
                                {
                                    "title": "Pydantic схема для валидации",
                                    "code": "from pydantic import BaseModel, EmailStr, validator\n\nclass UserCreate(BaseModel):\n    email: EmailStr\n    password: str\n    \n    @validator('password')\n    def validate_password(cls, v):\n        if len(v) < 8:\n            raise ValueError('Password must be at least 8 characters')\n        return v"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "JWT токены",
                        "description": "Реализуйте генерацию и валидацию JWT токенов",
                        "type": "task",
                        "content": {
                            "task": "Создайте эндпоинты для регистрации и входа",
                            "requirements": ["Access и Refresh токены", "Middleware для проверки токенов", "Обработка истечения токенов"],
                            "examples": [
                                {
                                    "title": "Генерация JWT токена",
                                    "code": "from datetime import datetime, timedelta\nfrom jose import jwt\n\nSECRET_KEY = \"your-secret-key\"\nALGORITHM = \"HS256\"\nACCESS_TOKEN_EXPIRE_MINUTES = 30\n\ndef create_access_token(data: dict, expires_delta: timedelta = None):\n    to_encode = data.copy()\n    if expires_delta:\n        expire = datetime.utcnow() + expires_delta\n    else:\n        expire = datetime.utcnow() + timedelta(minutes=15)\n    to_encode.update({\"exp\": expire})\n    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)\n    return encoded_jwt"
                                },
                                {
                                    "title": "Эндпоинт для входа",
                                    "code": "@app.post(\"/login\")\ndef login(user_credentials: UserLogin, db: Session = Depends(get_db)):\n    user = db.query(User).filter(User.email == user_credentials.email).first()\n    if not user or not user.check_password(user_credentials.password):\n        raise HTTPException(status_code=401, detail=\"Invalid credentials\")\n    \n    access_token = create_access_token(data={\"sub\": user.email})\n    return {\"access_token\": access_token, \"token_type\": \"bearer\"}"
                                },
                                {
                                    "title": "Middleware для проверки токена",
                                    "code": "from fastapi import Depends, HTTPException\nfrom fastapi.security import HTTPBearer, HTTPAuthorizationCredentials\n\nsecurity = HTTPBearer()\n\ndef get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):\n    token = credentials.credentials\n    try:\n        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])\n        email: str = payload.get(\"sub\")\n        if email is None:\n            raise HTTPException(status_code=401, detail=\"Invalid token\")\n    except JWTError:\n        raise HTTPException(status_code=401, detail=\"Invalid token\")\n    return user"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Защита эндпоинтов",
                        "description": "Добавьте авторизацию к защищенным эндпоинтам",
                        "type": "task",
                        "content": {
                            "task": "Защитите приватные эндпоинты",
                            "requirements": ["Ролевая авторизация", "Rate limiting", "CORS настройки"]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "intermediate"
            },
            {
                "title": "SQL запросы и оптимизация",
                "description": "Научитесь писать эффективные SQL запросы и оптимизировать производительность",
                "track_id": 3,  # Data Analyst
                "steps": [
                    {
                        "id": 1,
                        "title": "Сложные JOIN запросы",
                        "description": "Изучите различные типы JOIN операций",
                        "type": "task",
                        "content": {
                            "task": "Напишите запросы с INNER, LEFT, RIGHT и FULL JOIN",
                            "requirements": ["Множественные таблицы", "Алиасы", "Условия соединения"],
                            "examples": [
                                {
                                    "title": "INNER JOIN",
                                    "code": "SELECT \n    p.name,\n    c.name as category\nFROM products p\nINNER JOIN categories c ON p.category_id = c.id;"
                                },
                                {
                                    "title": "LEFT JOIN (включая записи без связи)",
                                    "code": "SELECT \n    u.name,\n    o.total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;"
                                },
                                {
                                    "title": "Множественные JOIN",
                                    "code": "SELECT \n    o.id,\n    u.name as user_name,\n    p.name as product_name,\n    oi.quantity\nFROM orders o\nINNER JOIN users u ON o.user_id = u.id\nINNER JOIN order_items oi ON o.id = oi.order_id\nINNER JOIN products p ON oi.product_id = p.id;"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Агрегация и группировка",
                        "description": "Используйте GROUP BY, HAVING и агрегатные функции",
                        "type": "task",
                        "content": {
                            "task": "Создайте отчеты с группировкой данных",
                            "requirements": ["COUNT, SUM, AVG, MAX, MIN", "Группировка по нескольким полям", "HAVING для фильтрации групп"],
                            "examples": [
                                {
                                    "title": "Базовые агрегатные функции",
                                    "code": "SELECT \n    category,\n    COUNT(*) as total_products,\n    SUM(price) as total_revenue,\n    AVG(price) as avg_price,\n    MAX(price) as max_price,\n    MIN(price) as min_price\nFROM products\nGROUP BY category;"
                                },
                                {
                                    "title": "Группировка по нескольким полям",
                                    "code": "SELECT \n    region,\n    product_category,\n    COUNT(*) as sales_count,\n    SUM(amount) as total_amount\nFROM sales\nGROUP BY region, product_category\nORDER BY region, total_amount DESC;"
                                },
                                {
                                    "title": "HAVING для фильтрации групп",
                                    "code": "SELECT \n    customer_id,\n    COUNT(*) as order_count,\n    SUM(total) as total_spent\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 5 AND SUM(total) > 10000;"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Оптимизация запросов",
                        "description": "Улучшите производительность с помощью индексов",
                        "type": "presentation",
                        "content": {
                            "task": "Проанализируйте план выполнения и оптимизируйте запросы",
                            "requirements": ["EXPLAIN запросов", "Создание индексов", "Избежание N+1 проблем"]
                        }
                    }
                ],
                "duration": "60-90 минут",
                "level": "intermediate"
            },
            {
                "title": "Дизайн системы для мобильного приложения",
                "description": "Создайте полный дизайн-систему компонентов для мобильного приложения",
                "track_id": 4,  # UI/UX Designer
                "steps": [
                    {
                        "id": 1,
                        "title": "Дизайн-токены",
                        "description": "Определите цветовую палитру и типографику",
                        "type": "task",
                        "content": {
                            "task": "Создайте дизайн-систему с цветами, шрифтами и отступами",
                            "requirements": ["Цветовая палитра (primary, secondary, neutral)", "Типографическая шкала", "Spacing система"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Компоненты UI",
                        "description": "Создайте библиотеку переиспользуемых компонентов",
                        "type": "task",
                        "content": {
                            "task": "Разработайте компоненты: Button, Input, Card, Modal",
                            "requirements": ["Состояния компонентов (hover, active, disabled)", "Варианты размеров", "Адаптивность"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Документация",
                        "description": "Создайте документацию для дизайн-системы",
                        "type": "presentation",
                        "content": {
                            "task": "Оформите руководство по использованию компонентов",
                            "requirements": ["Storybook или Figma документация", "Примеры использования", "Guidelines"]
                        }
                    }
                ],
                "duration": "120-150 минут",
                "level": "intermediate"
            },
            {
                "title": "A/B тестирование и аналитика",
                "description": "Настройте A/B тесты для оптимизации продукта и аналитику",
                "track_id": 5,  # Product Manager
                "steps": [
                    {
                        "id": 1,
                        "title": "Планирование эксперимента",
                        "description": "Определите гипотезу и метрики для теста",
                        "type": "analysis",
                        "content": {
                            "task": "Сформулируйте гипотезу и выберите метрики успеха",
                            "requirements": ["Нулевая и альтернативная гипотезы", "Primary и secondary метрики", "Размер выборки"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Настройка теста",
                        "description": "Настройте инструмент для A/B тестирования",
                        "type": "task",
                        "content": {
                            "task": "Используйте Optimizely или Google Optimize",
                            "requirements": ["Создание вариантов", "Сегментация аудитории", "Правила распределения трафика"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Анализ результатов",
                        "description": "Проанализируйте данные и сделайте выводы",
                        "type": "presentation",
                        "content": {
                            "task": "Интерпретируйте результаты теста",
                            "requirements": ["Статистическая значимость", "Визуализация результатов", "Рекомендации по внедрению"]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "advanced"
            },
            {
                "title": "SEO оптимизация сайта",
                "description": "Оптимизируйте сайт для поисковых систем",
                "track_id": 6,  # Digital Marketing
                "steps": [
                    {
                        "id": 1,
                        "title": "Технический SEO",
                        "description": "Проверьте технические аспекты сайта",
                        "type": "analysis",
                        "content": {
                            "task": "Проанализируйте техническое состояние сайта",
                            "requirements": ["Скорость загрузки", "Мобильная версия", "Sitemap и robots.txt", "Структурированные данные"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Контент и ключевые слова",
                        "description": "Оптимизируйте контент под ключевые слова",
                        "type": "task",
                        "content": {
                            "task": "Создайте SEO-оптимизированный контент",
                            "requirements": ["Исследование ключевых слов", "Оптимизация мета-тегов", "Заголовки и структура контента"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Ссылочная масса",
                        "description": "Разработайте стратегию получения обратных ссылок",
                        "type": "presentation",
                        "content": {
                            "task": "Создайте план линкбилдинга",
                            "requirements": ["Поиск возможностей для ссылок", "Создание линкбельного контента", "Мониторинг и анализ ссылок"]
                        }
                    }
                ],
                "duration": "75-90 минут",
                "level": "beginner"
            },
            {
                "title": "TypeScript проект с строгой типизацией",
                "description": "Создайте полноценный TypeScript проект с типами и интерфейсами",
                "track_id": 1,  # Frontend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Настройка TypeScript",
                        "description": "Настройте строгий режим TypeScript",
                        "type": "task",
                        "content": {
                            "task": "Создайте tsconfig.json с строгими правилами",
                            "requirements": ["strict mode", "noImplicitAny", "strictNullChecks", "Правильные настройки модулей"]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Типы и интерфейсы",
                        "description": "Определите типы для всего проекта",
                        "type": "task",
                        "content": {
                            "task": "Создайте типы для API, компонентов и состояний",
                            "requirements": ["Generics", "Utility types", "Discriminated unions", "Type guards"]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Типизация компонентов",
                        "description": "Используйте TypeScript в React компонентах",
                        "type": "task",
                        "content": {
                            "task": "Типизируйте props, state и события",
                            "requirements": ["React.FC или явная типизация", "Типизация хуков", "Типизация событий"]
                        }
                    }
                ],
                "duration": "90-120 минут",
                "level": "intermediate"
            },
            {
                "title": "Docker контейнеризация приложения",
                "description": "Упакуйте приложение в Docker контейнеры и настройте Docker Compose",
                "track_id": 2,  # Backend Developer
                "steps": [
                    {
                        "id": 1,
                        "title": "Создание Dockerfile",
                        "description": "Создайте Dockerfile для приложения",
                        "type": "task",
                        "content": {
                            "task": "Напишите оптимизированный Dockerfile",
                            "requirements": ["Multi-stage builds", "Минимальный размер образа", "Кэширование слоев", "Security best practices"],
                            "examples": [
                                {
                                    "title": "Multi-stage Dockerfile для Python",
                                    "code": "# Стадия сборки\nFROM python:3.11-slim as builder\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --user --no-cache-dir -r requirements.txt\n\n# Финальная стадия\nFROM python:3.11-slim\nWORKDIR /app\nCOPY --from=builder /root/.local /root/.local\nCOPY . .\nENV PATH=/root/.local/bin:$PATH\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\"]"
                                },
                                {
                                    "title": "Оптимизации",
                                    "content": "✅ Используйте .dockerignore\n✅ Копируйте requirements.txt перед COPY .\n✅ Используйте конкретные теги (не latest)\n✅ Объединяйте RUN команды\n✅ Используйте non-root пользователя"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Docker Compose",
                        "description": "Настройте docker-compose для разработки",
                        "type": "task",
                        "content": {
                            "task": "Создайте docker-compose.yml с несколькими сервисами",
                            "requirements": ["Приложение", "База данных", "Redis (опционально)", "Volumes и networks"],
                            "examples": [
                                {
                                    "title": "Пример docker-compose.yml",
                                    "code": "version: '3.8'\n\nservices:\n  app:\n    build: .\n    ports:\n      - \"8000:8000\"\n    environment:\n      - DATABASE_URL=postgresql://user:pass@db:5432/mydb\n    depends_on:\n      - db\n      - redis\n    volumes:\n      - .:/app\n\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: mydb\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    ports:\n      - \"5432:5432\"\n\n  redis:\n    image: redis:7-alpine\n    ports:\n      - \"6379:6379\"\n\nvolumes:\n  postgres_data:"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Оптимизация",
                        "description": "Оптимизируйте размер и производительность",
                        "type": "presentation",
                        "content": {
                            "task": "Проанализируйте и улучшите конфигурацию",
                            "requirements": ["Уменьшение размера образа", "Оптимизация времени сборки", "Health checks"]
                        }
                    }
                ],
                "duration": "60-90 минут",
                "level": "beginner"
            },
            {
                "title": "Визуализация данных с Python",
                "description": "Создайте интерактивные дашборды с использованием Plotly и Dash",
                "track_id": 3,  # Data Analyst
                "steps": [
                    {
                        "id": 1,
                        "title": "Подготовка данных",
                        "description": "Загрузите и обработайте данные для визуализации",
                        "type": "task",
                        "content": {
                            "task": "Используйте pandas для загрузки и очистки данных",
                            "requirements": ["Чтение CSV/Excel", "Фильтрация и группировка", "Подготовка данных"],
                            "examples": [
                                {
                                    "title": "Загрузка и обработка данных",
                                    "code": "import pandas as pd\n\n# Загрузка из CSV\ndf = pd.read_csv('data.csv')\n\n# Загрузка из Excel\ndf = pd.read_excel('data.xlsx', sheet_name='Sheet1')\n\n# Фильтрация\ndf_filtered = df[df['sales'] > 1000]\n\n# Группировка\ndf_grouped = df.groupby('category').agg({\n    'sales': ['sum', 'mean', 'count']\n})\n\n# Преобразование дат\ndf['date'] = pd.to_datetime(df['date'])"
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "Создание графиков",
                        "description": "Создайте различные типы визуализаций",
                        "type": "task",
                        "content": {
                            "task": "Используйте Plotly для создания графиков",
                            "requirements": ["Line charts", "Bar charts", "Scatter plots", "Heatmaps", "Интерактивность"],
                            "examples": [
                                {
                                    "title": "Примеры Plotly графиков",
                                    "code": "import plotly.express as px\nimport plotly.graph_objects as go\n\n# Линейный график\nfig = px.line(df, x='date', y='sales', title='Динамика продаж')\nfig.show()\n\n# Столбчатая диаграмма\nfig = px.bar(df, x='category', y='sales', color='region')\nfig.show()\n\n# Scatter plot\nfig = px.scatter(df, x='price', y='sales', size='quantity', color='category')\nfig.show()\n\n# Heatmap\nfig = px.imshow(df.corr(), title='Корреляционная матрица')\nfig.show()"
                                }
                            ]
                        }
                    },
                    {
                        "id": 3,
                        "title": "Dash дашборд",
                        "description": "Создайте интерактивный веб-дашборд",
                        "type": "presentation",
                        "content": {
                            "task": "Разработайте дашборд с фильтрами и обновлениями",
                            "requirements": ["Компоненты дашборда", "Callback функции", "Динамические обновления", "Деployment"],
                            "examples": [
                                {
                                    "title": "Базовый Dash дашборд",
                                    "code": "import dash\nfrom dash import dcc, html, Input, Output\nimport plotly.express as px\n\napp = dash.Dash(__name__)\n\napp.layout = html.Div([\n    html.H1('Аналитика продаж'),\n    dcc.Dropdown(\n        id='category-dropdown',\n        options=[{'label': cat, 'value': cat} for cat in df['category'].unique()],\n        value=df['category'].unique()[0]\n    ),\n    dcc.Graph(id='sales-chart')\n])\n\n@app.callback(\n    Output('sales-chart', 'figure'),\n    Input('category-dropdown', 'value')\n)\ndef update_chart(category):\n    filtered_df = df[df['category'] == category]\n    fig = px.line(filtered_df, x='date', y='sales')\n    return fig\n\nif __name__ == '__main__':\n    app.run_server(debug=True)"
                                }
                            ]
                        }
                    }
                ],
                "duration": "120-150 минут",
                "level": "intermediate"
            }
        ]
        
        for sim_data in simulations_data:
            existing_sim = db.query(Simulation).filter(
                Simulation.title == sim_data["title"]
            ).first()
            
            if existing_sim:
                # Обновить существующую симуляцию с новыми примерами
                existing_sim.description = sim_data.get("description", existing_sim.description)
                existing_sim.steps = sim_data["steps"]
                existing_sim.duration = sim_data.get("duration", existing_sim.duration)
                existing_sim.level = sim_data.get("level", existing_sim.level)
            else:
                simulation = Simulation(**sim_data)
                db.add(simulation)
        
        db.commit()
        
        # Create achievements
        achievements_data = [
            {
                "code": "first_steps",
                "name": "Первые шаги",
                "description": "Завершите свою первую симуляцию",
                "icon": "🎯",
                "points_reward": 50,
                "category": "learning",
                "requirement_type": "simulations_completed",
                "requirement_value": 1,
                "is_hidden": False
            },
            {
                "code": "explorer",
                "name": "Исследователь",
                "description": "Завершите 5 симуляций",
                "icon": "🗺️",
                "points_reward": 150,
                "category": "learning",
                "requirement_type": "simulations_completed",
                "requirement_value": 5,
                "is_hidden": False
            },
            {
                "code": "master",
                "name": "Мастер",
                "description": "Завершите 10 симуляций",
                "icon": "👑",
                "points_reward": 300,
                "category": "mastery",
                "requirement_type": "simulations_completed",
                "requirement_value": 10,
                "is_hidden": False
            },
            {
                "code": "certified_beginner",
                "name": "Сертифицированный новичок",
                "description": "Получите свой первый сертификат",
                "icon": "📜",
                "points_reward": 100,
                "category": "learning",
                "requirement_type": "certificates_earned",
                "requirement_value": 1,
                "is_hidden": False
            },
            {
                "code": "certified_expert",
                "name": "Сертифицированный эксперт",
                "description": "Получите 5 сертификатов",
                "icon": "🏆",
                "points_reward": 500,
                "category": "mastery",
                "requirement_type": "certificates_earned",
                "requirement_value": 5,
                "is_hidden": False
            },
            {
                "code": "streak_week",
                "name": "Неделя обучения",
                "description": "Занимайтесь 7 дней подряд",
                "icon": "🔥",
                "points_reward": 200,
                "category": "special",
                "requirement_type": "streak_days",
                "requirement_value": 7,
                "is_hidden": False
            },
            {
                "code": "streak_month",
                "name": "Месяц обучения",
                "description": "Занимайтесь 30 дней подряд",
                "icon": "💪",
                "points_reward": 1000,
                "category": "special",
                "requirement_type": "streak_days",
                "requirement_value": 30,
                "is_hidden": False
            },
            {
                "code": "assessment_complete",
                "name": "Знай себя",
                "description": "Пройдите профориентационный тест",
                "icon": "🧠",
                "points_reward": 30,
                "category": "learning",
                "requirement_type": "assessments_completed",
                "requirement_value": 1,
                "is_hidden": False
            },
            {
                "code": "level_5",
                "name": "Уровень 5",
                "description": "Достигните 5 уровня",
                "icon": "⭐",
                "points_reward": 250,
                "category": "mastery",
                "requirement_type": "level",
                "requirement_value": 5,
                "is_hidden": False
            },
            {
                "code": "level_10",
                "name": "Уровень 10",
                "description": "Достигните 10 уровня",
                "icon": "🌟",
                "points_reward": 500,
                "category": "mastery",
                "requirement_type": "level",
                "requirement_value": 10,
                "is_hidden": False
            },
            {
                "code": "points_1000",
                "name": "Тысяча очков",
                "description": "Заработайте 1000 очков",
                "icon": "💎",
                "points_reward": 0,
                "category": "special",
                "requirement_type": "total_points",
                "requirement_value": 1000,
                "is_hidden": False
            },
            {
                "code": "points_5000",
                "name": "Пять тысяч очков",
                "description": "Заработайте 5000 очков",
                "icon": "💸",
                "points_reward": 0,
                "category": "special",
                "requirement_type": "total_points",
                "requirement_value": 5000,
                "is_hidden": True
            },
            {
                "code": "dedicated",
                "name": "Преданный ученик",
                "description": "Завершите 25 симуляций",
                "icon": "🎓",
                "points_reward": 750,
                "category": "mastery",
                "requirement_type": "simulations_completed",
                "requirement_value": 25,
                "is_hidden": False
            },
            {
                "code": "early_bird",
                "name": "Ранняя пташка",
                "description": "Займитесь обучением в первый день регистрации",
                "icon": "🐦",
                "points_reward": 50,
                "category": "special",
                "requirement_type": "streak_days",
                "requirement_value": 1,
                "is_hidden": True
            }
        ]
        
        for ach_data in achievements_data:
            existing_ach = db.query(Achievement).filter(
                Achievement.code == ach_data["code"]
            ).first()
            
            if not existing_ach:
                achievement = Achievement(**ach_data)
                db.add(achievement)

        # Load Supabase realistic simulations dataset for the new frontend
        data_path = Path(__file__).resolve().parent / "data_realistic_simulations.json"
        load_realistic_simulations(db, data_path)

        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
