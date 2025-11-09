# 🚀 Naviq - Статус проекта

## ✅ Что работает

### Backend (FastAPI)
- **URL**: http://127.0.0.1:8000
- **Статус**: ✅ Работает
- **База данных**: SQLite (naviq.db)
- **API документация**: http://127.0.0.1:8000/docs

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Статус**: ✅ Работает
- **UI**: Современный дизайн с градиентами
- **Анимации**: Framer Motion

### API Endpoints
- ✅ `GET /health` - Health check
- ✅ `GET /api/tracks/` - Карьерные направления
- ✅ `POST /api/auth/register` - Регистрация
- ✅ `POST /api/auth/login` - Авторизация
- ✅ `GET /api/auth/me` - Текущий пользователь

### База данных
- ✅ SQLite база данных создана
- ✅ Модели: User, CareerTrack, Simulation, AssessmentSession
- ✅ Тестовые данные загружены

## 🎯 Демо аккаунты

1. **Админ**: admin@naviq.com / admin
2. **Тестовый**: demo@example.com / demo123
3. **Frontend**: frontend@example.com / frontend123

## 🧪 Тестирование

### Через curl:
```bash
# Health check
curl http://127.0.0.1:8000/health

# Получить треки
curl http://127.0.0.1:8000/api/tracks/

# Регистрация
curl -X POST "http://127.0.0.1:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "test123"}'

# Логин
curl -X POST "http://127.0.0.1:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123"
```

### Через браузер:
- **Frontend**: http://localhost:3000
- **API Docs**: http://127.0.0.1:8000/docs
- **Test Page**: Откройте test.html в браузере

## 🔧 Технические детали

### Backend
- **FastAPI** 0.118.2
- **SQLAlchemy** 2.0.43
- **Pydantic** 2.12.0
- **JWT** аутентификация
- **CORS** настроен для localhost:3000

### Frontend
- **Next.js** 14.0.3
- **React** 18
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

### База данных
- **SQLite** (файл: naviq.db)
- **Модели**: User, CareerTrack, Simulation, AssessmentSession, Submission, Certificate

## 🚀 Запуск

### Backend:
```bash
cd /Users/ibragimkadamzanov/PycharmProjects/naviq
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend:
```bash
cd /Users/ibragimkadamzanov/PycharmProjects/naviq/frontend
npm run dev
```

## 📊 Текущий статус

- ✅ **Backend API** - Полностью работает
- ✅ **Frontend UI** - Запущен и доступен
- ✅ **База данных** - SQLite настроена
- ✅ **Аутентификация** - JWT работает
- ✅ **CORS** - Настроен
- ✅ **API документация** - Доступна

## 🎉 Готово к использованию!

Платформа Naviq полностью функциональна и готова к тестированию и дальнейшей разработке.

**Следующие шаги:**
1. Откройте http://localhost:3000 в браузере
2. Протестируйте регистрацию и логин
3. Изучите API документацию на http://127.0.0.1:8000/docs
4. Начните разработку дополнительных функций

