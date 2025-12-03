# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Naviq is an AI-powered career navigation platform that helps students and young professionals discover career paths through personalized assessments and career simulations. The platform uses OpenAI for career analysis and machine learning for track prediction.

**Stack:**
- **Backend:** FastAPI + SQLAlchemy + SQLite (PostgreSQL for production)
- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **AI/ML:** OpenAI API, scikit-learn, PyTorch + transformers
- **Auth:** JWT tokens with HTTPBearer

## Development Commands

### Backend Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server (auto-reload enabled)
uvicorn app.main:app --reload

# Initialize/seed database
python app/init_db.py

# Create admin user
python create_admin.py

# Run ML training
python -m app.ml.train_model
```

### Frontend Development

```bash
cd "Career Navigation Platform"

# Install dependencies
npm install

# Run development server (Vite)
npm run dev

# Build for production
npm run build
```

### Docker Development

```bash
# Run full stack with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Production deployment with Nginx
docker-compose --profile production up -d
```

### Database Operations

```bash
# The database schema auto-creates on startup via Base.metadata.create_all()
# Migrations are handled manually through database.py:ensure_additional_columns()

# Delete user assessment data (utility script)
python delete_user_assessment.py

# Seed simulations
python app/seed_marketing_simulation.py

# Seed assessment questions
python app/seed_assessment_questions.py
```

## Architecture

### Backend Structure

The backend follows a modular router-based architecture:

- **app/main.py** - Application entry point, registers all routers and middleware
- **app/routers/** - Feature-based API endpoints:
  - `auth.py` - Authentication (login, signup, Google OAuth, complete profile)
  - `assessment.py` - Career assessment questions and AI analysis
  - `simulations.py` - Career simulation CRUD and progress tracking
  - `courses.py` - Course management
  - `admin.py` - Admin analytics and management
  - `gamification.py` - User stats, achievements, leaderboard
  - `tracks.py` - Career track information
  - `certificates.py` - Certificate generation with QR codes
  - `new_front.py` - Frontend-specific API endpoints
- **app/models.py** - SQLAlchemy ORM models
- **app/schemas.py** - Pydantic request/response schemas
- **app/auth.py** - JWT token creation/validation, password hashing
- **app/database.py** - Database session management and schema migrations
- **app/config.py** - Environment-based configuration via pydantic-settings
- **app/ai_service.py** - OpenAI integration for career assessment analysis
- **app/services/** - Business logic modules
- **app/ml/** - Machine learning models for career track prediction
- **career_ml.py** - ML training pipeline (imports used by ai_service.py)

### Key Backend Patterns

1. **Database Sessions:** Use `get_db()` dependency injection for SQLAlchemy sessions
2. **Authentication:** Use `get_current_user()` or `get_current_admin()` dependencies for protected routes
3. **Schema Migrations:** SQLite schema changes handled via `ensure_additional_columns()` function that runs on import
4. **CORS:** Configured in main.py with explicit origins and regex patterns for production IPs

### Frontend Structure

The frontend is a single-page application (SPA) with component-based routing:

- **src/App.tsx** - Main application component with client-side routing logic
- **src/components/** - Organized by feature domain:
  - `admin/` - Admin panel with dashboard, user management, course/simulation CRUD
  - `auth/` - Login and Signup components
  - `assessment/` - Career assessment flow (AssessmentNew, AssessmentResults)
  - `dashboard/` - User dashboard and CareerResultsModern
  - `landing/` - Landing pages (NewLanding is active)
  - `profile/` - User profile and CompleteProfile flow
  - `simulation/` - SimulationCatalog and SimulationPlayer
  - `gamification/` - Gamification features
  - `common/` - Reusable components (animated-background, constellation-icon, etc.)
  - `ui/` - shadcn/ui component library
- **src/utils/api.ts** - Centralized API route definitions and URL building
- **src/main.tsx** - React app entry point
- **src/index.css** - Global styles with Tailwind

### Key Frontend Patterns

1. **Authentication State:** Token stored in localStorage as `naviq_access_token`, user data as `naviq_user`
2. **Page Navigation:** App.tsx manages page state via `currentPage` state (no react-router)
3. **API Calls:** Use `buildApiUrl()` from `utils/api.ts` to construct API URLs
4. **Protected Routes:** App.tsx checks auth on `useEffect` for protected pages
5. **Component Exports:** Each feature folder has `index.ts` for clean imports (e.g., `import { Login, Signup } from './components/auth'`)

## API Integration

The backend runs on `http://localhost:8000` by default, frontend on `http://localhost:5173` (Vite) or `http://localhost:3000` (Next.js, legacy).

Frontend API configuration:
- Production: `https://naviq.uz/make-server-a1779b8e` (API_PREFIX)
- Local: Set `VITE_API_URL` environment variable or defaults to production URL

Backend CORS allows:
- localhost:3000, 3001, 5173 (all protocols)
- Production IPs: 62.72.20.193, 31.148.164.107 (with port wildcards via regex)

## AI/ML Features

### Career Assessment Flow

1. User answers assessment questions (multiple choice or chat-based)
2. Answers stored in `AssessmentSession.answers` (JSON field)
3. On submission, `ai_service.py` calls OpenAI API to analyze responses
4. ML model (`career_ml.py`) predicts best-fit career track from user responses
5. Results include track recommendation, skills, learning plan, courses

### ML Training

- Training data: CSV with user responses (`naviq_mock_responses.csv`)
- Model: Logistic Regression (scikit-learn) + optional deep learning (PyTorch)
- Training script: `python -m app.ml.train_model`
- Results logged to `ML_TRAINING_RESULTS.md`

### Assessment Question System

- Questions stored in DB (`AssessmentQuestionModel`)
- Supports multiple types: choice, chat
- Questions have weights mapping answer options to career tracks
- Seeded via `ASSESSMENT_QUESTIONS` constant in `app/services/assessment_questions_data.py`

## Database Schema

Key models:
- **User** - Core user model with auth fields (email, hashed_password, google_id), profile fields, role (student/admin)
- **AssessmentSession** - Tracks user assessment attempts, stores answers/messages/result as JSON
- **AssessmentQuestionModel** - Assessment question bank with options and weights
- **CareerTrack** - Career path definitions (name, skills, salary, growth prospects)
- **Simulation** - Career simulation definitions with steps (JSON array)
- **Submission** - User simulation attempts with answers and scores
- **Certificate** - Generated certificates for completed simulations
- **UserStats** - Gamification stats (level, XP, streak)
- **UserAchievement** - User achievement unlocks
- **Achievement** - Achievement definitions

## Environment Variables

Required in `.env` file:
```bash
DATABASE_URL=sqlite:///./naviq.db  # or PostgreSQL URL for production
SECRET_KEY=your-secret-key-here-change-in-production
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

Optional:
```bash
DEBUG=True
REDIS_URL=redis://localhost:6379/0
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@naviq.com
```

## Testing Access

Default admin account (after running `create_admin.py` or seeded in init_db.py):
- Email: admin@naviq.com
- Password: admin123

## Course System Architecture

### Course Structure (Modular Learning)
- **Course** → **Modules** → **Lessons** → **Simulations**
- Courses contain modules (JSON in `content` field)
- Each module has lessons (text/video/quiz/practice types)
- Simulations can be linked to courses with unlock requirements
- Progress tracking per lesson via `LessonProgress` model

### Course-Simulation Integration
- Simulations link to courses via `course_id` (nullable)
- `required_progress` field: 0-100% course completion needed to unlock
- `unlock_message`: custom message shown when simulation unlocks
- Automatic unlock when module completed or progress threshold reached

### XP & Gamification
- +10 XP per lesson completion
- +50 XP per module completion
- +200 XP per course completion
- Automatic level-up in UserStats
- Tracked in `CourseEnrollment.lessons_completed` (JSON)

### Key Endpoints
```bash
# Public
GET /api/courses - list all courses
GET /api/courses/{id} - course details

# Student (auth required)
POST /api/courses/enroll - enroll in course
GET /api/courses/{id}/progress - user progress
GET /api/courses/{id}/modules - course modules
PUT /api/courses/{id}/lessons/{lesson_id}/complete - complete lesson (awards XP)
GET /api/courses/{id}/simulations - linked simulations with unlock status

# Admin
PUT /api/admin/courses/{id}/content - update course content
POST /api/admin/courses/{id}/link-simulation - link simulation to course
GET /api/admin/courses/analytics - course analytics
```

### Seeding Courses
```bash
python -m app.seed_marketing_course  # Creates Marketing Fundamentals course
```

## Important Notes

1. **Password Hashing:** Uses SHA256 (simple but not production-ready - consider bcrypt/argon2)
2. **Database Migrations:** Manual via `ensure_additional_columns()` - no Alembic migrations
3. **Frontend Routing:** Custom page state management, not using react-router
4. **API Prefix:** Production uses `/make-server-a1779b8e` prefix for backend routes
5. **Component Organization:** Components reorganized by feature (Nov 2024) - see `Career Navigation Platform/src/components/README.md`
6. **Deprecated Components:** Old assessment/landing components kept but unused (AssessmentNew/NewLanding are active)
7. **Course Rating Storage:** Stored as integer (48 = 4.8 stars), divide by 10 for display
8. **JSON Fields:** `lessons_completed` and `unlocked_simulations` stored as JSON strings in SQLite
