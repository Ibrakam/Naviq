#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="$ROOT_DIR/deploy/.env"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
DUMP_FILE="${1:-}"

if [ -z "$DUMP_FILE" ]; then
  echo "Usage: ./deploy/db-import-prod.sh /path/to/backup.dump"
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "[db-import] dump file not found: $DUMP_FILE"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[db-import] deploy/.env not found: $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
  echo "[db-import] POSTGRES_USER/POSTGRES_DB are required in deploy/.env"
  exit 1
fi

cd "$ROOT_DIR"

echo "[db-import] ensuring postgres is running"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres

echo "[db-import] waiting for postgres health"
tries=0
while :; do
  tries=$((tries + 1))
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    break
  fi
  if [ "$tries" -ge 60 ]; then
    echo "[db-import] postgres did not become ready in time"
    exit 1
  fi
  sleep 2
done

echo "[db-import] stopping app services to avoid write conflicts"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop backend frontend celery_worker celery_beat caddy || true

echo "[db-import] resetting public schema"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

echo "[db-import] uploading dump into postgres container"
CONTAINER_ID=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q postgres)
docker cp "$DUMP_FILE" "$CONTAINER_ID:/tmp/restore.dump"

echo "[db-import] restoring dump"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_restore \
    --no-owner \
    --no-privileges \
    --if-exists \
    --clean \
    --single-transaction \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    /tmp/restore.dump

echo "[db-import] applying latest migrations after restore"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "[db-import] starting full stack"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo "[db-import] done"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
