# Naviq Production Deploy

## Files

- `../docker-compose.prod.yml` - production stack
- `./.env.example` - environment template
- `./caddy/Caddyfile` - reverse proxy + TLS for domain
- `./up.sh` / `./down.sh` - helper scripts

## Quick Start

1. Copy env and edit values:

```bash
cp deploy/.env.example deploy/.env
```

2. Set DNS:
- `A naviq.uz -> SERVER_IP`
- `A www.naviq.uz -> SERVER_IP`
- `A app.naviq.uz -> SERVER_IP`
- `A api.naviq.uz -> SERVER_IP`

3. Run:

```bash
./deploy/up.sh
```

4. Check status/logs:

```bash
docker compose -f docker-compose.prod.yml --env-file deploy/.env ps
docker compose -f docker-compose.prod.yml --env-file deploy/.env logs -f caddy backend frontend
```

## Ports

- Landing: `4173`
- Product Frontend (Next.js): `3001`
- Backend API (FastAPI): `8001`

## Domains

- `https://naviq.uz` and `https://www.naviq.uz` -> landing
- `https://app.naviq.uz` -> product frontend
- `https://api.naviq.uz` -> backend API

## Update On Server (git pull + restart)

```bash
chmod +x deploy/update.sh deploy/up.sh deploy/down.sh
make prod-update BRANCH=main
```

5. Stop:

```bash
./deploy/down.sh
```

## Move Local DB To Server

From your local machine:

```bash
chmod +x deploy/db-export-local.sh deploy/db-import-prod.sh deploy/db-push-to-server.sh
make db-push-server REMOTE=root@YOUR_SERVER_IP APP_DIR=/opt/naviq
```

This command:
- creates a fresh local PostgreSQL dump,
- uploads it to the server,
- restores it into production Postgres (`docker-compose.prod.yml`),
- runs latest migrations,
- starts full stack.

If you already have dump file:

```bash
make db-push-server REMOTE=root@YOUR_SERVER_IP APP_DIR=/opt/naviq DUMP=deploy/dumps/my.dump
```

If server uses custom SSH port/key:

```bash
SSH_OPTS="-p 2222 -i ~/.ssh/id_rsa" make db-push-server REMOTE=deploy@YOUR_SERVER_IP APP_DIR=/opt/naviq
```

## Notes

- Migrations are applied automatically by `migrate` service before API/celery startup.
- Set `SEED_ON_BOOT=1` only for first boot if you want seed data auto-loaded.
- Caddy provisions Let's Encrypt certificates automatically.
