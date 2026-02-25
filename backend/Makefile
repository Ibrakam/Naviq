.PHONY: help up down restart logs logs-celery migrate migration downgrade db-reset dev install celery lint format test shell seed clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# --- Infrastructure ---

up: ## Start infrastructure (postgres, redis, celery, flower)
	docker compose up -d

down: ## Stop infrastructure
	docker compose down

restart: ## Restart infrastructure
	docker compose down && docker compose up -d

logs: ## Tail all container logs
	docker compose logs -f

logs-celery: ## Tail celery worker logs
	docker compose logs -f celery_worker

logs-beat: ## Tail celery beat logs
	docker compose logs -f celery_beat

ps: ## Show running containers
	docker compose ps

# --- Database ---

migrate: ## Apply all pending migrations
	cd backend 2>/dev/null || true && alembic upgrade head

migration: ## Create new migration (usage: make migration m="add users table")
	cd backend 2>/dev/null || true && alembic revision --autogenerate -m "$(m)"

downgrade: ## Rollback last migration
	cd backend 2>/dev/null || true && alembic downgrade -1

db-reset: ## Drop DB, recreate, and apply all migrations
	docker compose exec postgres psql -U naviq -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	cd backend 2>/dev/null || true && alembic upgrade head

# --- Development ---

dev: ## Start FastAPI dev server with hot-reload
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

install: ## Install project dependencies
	pip install -e ".[dev]"

celery-local: ## Run celery worker locally (outside Docker)
	celery -A app.tasks.celery_app worker --loglevel=info

# --- Utilities ---

lint: ## Run linter checks
	ruff check app/ tests/
	ruff format --check app/ tests/

format: ## Auto-format code
	ruff format app/ tests/
	ruff check --fix app/ tests/

test: ## Run tests
	pytest -v

shell: ## Open Python shell with app context
	python -c "import asyncio; from app.database import async_session; print('Session ready: async_session')"

seed: ## Load initial data (professions, prompts)
	python -m app.seed

clean: ## Remove Docker volumes (full reset)
	docker compose down -v
	@echo "All volumes removed."
