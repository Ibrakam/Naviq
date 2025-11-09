# 🚀 Naviq - AI Career Navigation Platform

**AI, который ведёт тебя к карьере**

Naviq — это веб-платформа с элементами искусственного интеллекта, которая помогает студентам и молодым специалистам определить направление развития, получить персональные рекомендации и пройти карьерные симуляции.

## ✨ Основные возможности

- 🧠 **AI-профориентация** - Персонализированный тест с рекомендациями на основе ИИ
- 🎯 **Карьерные симуляции** - Практические задания для разных профессий  
- 📜 **Сертификаты** - Подтверждение прохождения с QR-кодом
- 📊 **Аналитика** - Отслеживание прогресса и достижений
- 👥 **Многопользовательская система** - Роли студент/админ

## 🏗️ Архитектура

### Backend (FastAPI)
- **FastAPI** - Современный веб-фреймворк для Python
- **PostgreSQL** - Основная база данных
- **SQLAlchemy** - ORM для работы с БД
- **OpenAI API** - ИИ для анализа профориентации
- **JWT** - Аутентификация пользователей
- **Celery + Redis** - Асинхронные задачи

### Frontend (Next.js)
- **Next.js 14** - React фреймворк
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Framer Motion** - Анимации
- **Axios** - HTTP клиент

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- OpenAI API ключ (для ИИ функций)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd naviq
```

### 2. Настройка окружения

```bash
# Скопируйте файл с переменными окружения
cp env.example .env

# Отредактируйте .env файл и добавьте ваш OpenAI API ключ
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Запуск с Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

### 4. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 5. Демо аккаунт

- **Email**: admin@naviq.com
- **Пароль**: admin123

## 📁 Структура проекта

```
naviq/
├── app/                    # Backend (FastAPI)
│   ├── routers/           # API маршруты
│   ├── models.py          # Модели базы данных
│   ├── schemas.py         # Pydantic схемы
│   ├── auth.py            # Аутентификация
│   ├── ai_service.py      # ИИ сервис
│   ├── database.py        # Настройка БД
│   ├── config.py          # Конфигурация
│   └── main.py            # Главный файл приложения
├── frontend/              # Frontend (Next.js)
│   ├── pages/             # Страницы
│   ├── components/        # React компоненты
│   ├── lib/               # Утилиты и API клиент
│   └── styles/            # Стили
├── docker-compose.yml     # Docker Compose конфигурация
├── Dockerfile             # Backend Docker образ
└── README.md              # Документация
```

## 🔧 Разработка

### Backend разработка

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск PostgreSQL и Redis
docker-compose up db redis -d

# Инициализация базы данных
python app/init_db.py

# Запуск сервера разработки
uvicorn app.main:app --reload
```

### Frontend разработка

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```

## 📊 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Профориентация
- `GET /api/assessment/questions` - Получить вопросы
- `POST /api/assessment/submit` - Отправить ответы
- `GET /api/assessment/result` - Получить результат

### Симуляции
- `GET /api/simulations` - Список симуляций
- `GET /api/simulations/{id}` - Детали симуляции
- `POST /api/simulations/{id}/start` - Начать симуляцию
- `PUT /api/simulations/{id}/submit` - Отправить ответы

### Карьерные направления
- `GET /api/tracks` - Список направлений
- `GET /api/tracks/{id}` - Детали направления

## 🎯 Основные модули

1. **Регистрация/авторизация** - Email/OAuth, роли студент/админ
2. **ИИ-профориентация** - Тест + скоринг + рекомендации LLM
3. **Каталог треков** - Отображение направлений
4. **Каталог симуляций** - Пошаговые кейсы
5. **Прохождение симуляций** - Выполнение заданий, сертификат
6. **Результаты и рекомендации** - Карьерные треки, план развития
7. **Профиль пользователя** - История, сертификаты
8. **Админ-панель** - CRUD симуляций, аналитика

## 🎨 Дизайн система

- **Цвета**: Интеллектуальный тёмно-синий (#1A2238), акцент — фиолетовый (#7B61FF)
- **Шрифт**: Inter
- **Стиль**: Современный, технологичный, дружелюбный
- **Референсы**: Notion, Duolingo, Figma Learn

## 🚀 Деплой

### Production с Nginx

```bash
# Запуск в production режиме
docker-compose --profile production up -d
```

### Переменные окружения для production

```bash
# .env
DATABASE_URL=postgresql://user:password@host:5432/db
SECRET_KEY=your-very-secure-secret-key
OPENAI_API_KEY=your-openai-api-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
```

## 📈 Метрики успеха

- Завершивших тест: ≥ 70%
- Перешедших к симуляции: ≥ 40%
- Средняя оценка UX: ≥ 4.6/5
- Возвраты через 7 дней: ≥ 30%

## 🔮 Планы развития (V2)

- AI-чат ассистент для карьерных вопросов
- Telegram бот
- Локализация (RU, UZ, EN)
- Геймификация (уровни, бейджи)
- Мобильное приложение
- Личный кабинет компаний

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Контакты

- **Email**: contact@naviq.com
- **Website**: https://naviq.com
- **Telegram**: @naviq_support

---

**Naviq — это AI-навигация по будущей карьере. Твоя отправная точка — один тест, одно решение, один путь к профессии.** 🚀
