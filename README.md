
# Naviq Project

This workspace currently contains three parts:

- Landing page (`src/`, Vite, default `http://localhost:5173`)
- Product frontend (`frontend/`, Next.js, default `http://localhost:3000`)
- Backend API (`backend/`, FastAPI, default `http://localhost:8000`)

## Landing setup

```bash
npm install
npm run dev
```

Optional env for landing -> app transitions:

```bash
echo "VITE_FRONTEND_APP_URL=http://localhost:3000" > .env.local
```

All main landing CTA buttons now redirect to the Next app auth pages.

## Product frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Backend setup

Use your existing backend workflow in `backend/` (FastAPI + Postgres + Redis + Celery).

## Production Docker Deploy (`naviq.uz`)

This repo includes a production stack:
- `docker-compose.prod.yml`
- `deploy/caddy/Caddyfile` (HTTPS + reverse proxy)
- `deploy/.env.example`
- `deploy/up.sh`, `deploy/down.sh`

### 1. Server prerequisites

- Ubuntu/Debian VPS with public IP
- Docker Engine + Docker Compose plugin installed
- Ports `80` and `443` open
- DNS records:
  - `A naviq.uz -> <SERVER_IP>`
  - `A www.naviq.uz -> <SERVER_IP>`
  - `A app.naviq.uz -> <SERVER_IP>`
  - `A api.naviq.uz -> <SERVER_IP>`

### 2. Configure env

```bash
cp deploy/.env.example deploy/.env
```

Edit `deploy/.env`:
- set strong `POSTGRES_PASSWORD`
- set matching `DATABASE_URL`/`DATABASE_URL_SYNC`
- set strong `SECRET_KEY`
- set `OPENAI_API_KEY`
- set `ACME_EMAIL` for Let's Encrypt
- keep domain config:
  - `DOMAIN=naviq.uz` (landing)
  - `APP_DOMAIN=app.naviq.uz` (Next.js app)
  - `API_DOMAIN=api.naviq.uz` (FastAPI)

### 3. Start

```bash
./deploy/up.sh
```

This will:
- build landing/frontend/backend images
- run migrations automatically
- optionally seed data (`SEED_ON_BOOT=1`)
- start Caddy with auto-HTTPS for all configured domains

Internal app ports in production:
- Landing: `4173`
- Frontend: `3001`
- Backend: `8001`

Server update after new push:

```bash
make prod-update BRANCH=main
```

### 4. Stop

```bash
./deploy/down.sh
```
  
