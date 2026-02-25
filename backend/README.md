# Naviq Backend

AI-powered career orientation platform API built with FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL.

## Quick Start

```bash
# 1. Install dependencies
make install

# 2. Copy env and configure
cp .env.example .env

# 3. Start infrastructure (Postgres, Redis, Celery, Flower)
make up

# 4. Run database migrations
make migrate

# 5. Load seed data (professions, AI prompts)
make seed

# 6. Start the dev server
make dev
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

## Services

| Service        | Port | Description                |
|---------------|------|----------------------------|
| FastAPI       | 8000 | API server (local)         |
| PostgreSQL    | 5432 | Main database              |
| Redis         | 6379 | Cache + Celery broker      |
| Flower        | 5555 | Celery task monitoring     |

## Makefile Commands

Run `make help` to see all available commands.

### Infrastructure
- `make up` — Start all Docker services
- `make down` — Stop services
- `make logs` — Tail container logs

### Database
- `make migrate` — Apply pending migrations
- `make migration m="description"` — Create new migration
- `make db-reset` — Full database reset

### Development
- `make dev` — Start FastAPI with hot-reload
- `make test` — Run tests
- `make lint` — Check code style
- `make format` — Auto-format code

## API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

### User
- `GET /api/v1/users/me`

### Skills
- `POST /api/v1/skills/analyze` — AI-powered skill analysis

### Professions
- `GET /api/v1/professions/` — List all professions
- `GET /api/v1/professions/{id}/gap` — Gap analysis vs current user
- `POST /api/v1/professions/generate-path` — Generate AI roadmap (async)
- `GET /api/v1/professions/tasks/{task_id}` — Task status for roadmap generation
- `GET /api/v1/professions/paths/{path_id}` — Get generated roadmap path for current user

### Simulations
- `GET /api/v1/simulations/` — List active simulations
- `POST /api/v1/simulations/{id}/start` — Start a simulation session
- `POST /api/v1/simulations/{id}/step` — Submit answer, get next step

### Courses
- `GET /api/v1/courses/recommend/{profession_id}` — Get recommended courses

### Admin (requires admin role)
- `GET/PATCH /api/v1/admin/users/` — User management
- CRUD `/api/v1/admin/simulations/` — Simulation builder
- CRUD `/api/v1/admin/courses/` — Course management
- CRUD `/api/v1/admin/prompts/` — AI prompt manager
- `GET /api/v1/admin/analytics/skill-heatmap`
- `GET /api/v1/admin/analytics/conversion`
- `GET /api/v1/admin/analytics/top-careers`
- `GET /api/v1/admin/analytics/dropoff`

## Architecture

```
FastAPI → Services → SQLAlchemy (PostgreSQL)
                  → OpenAI API
                  → Redis (cache + sessions)
                  → Celery (background tasks)
```
