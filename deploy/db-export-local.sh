#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BACKEND_ENV="$ROOT_DIR/backend/.env"
DUMPS_DIR="$ROOT_DIR/deploy/dumps"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUT_FILE_DEFAULT="$DUMPS_DIR/naviq_local_${TIMESTAMP}.dump"
OUT_FILE="${1:-$OUT_FILE_DEFAULT}"

if [ ! -f "$BACKEND_ENV" ]; then
  echo "[db-export] backend/.env not found: $BACKEND_ENV"
  exit 1
fi

DATABASE_URL_SYNC=$(grep -E '^DATABASE_URL_SYNC=' "$BACKEND_ENV" | head -n1 | cut -d= -f2-)
if [ -z "${DATABASE_URL_SYNC:-}" ]; then
  echo "[db-export] DATABASE_URL_SYNC is missing in backend/.env"
  exit 1
fi

DB_URL="$DATABASE_URL_SYNC"
DB_URL_NO_SCHEME=${DB_URL#postgresql://}
if [ "$DB_URL_NO_SCHEME" = "$DB_URL" ]; then
  echo "[db-export] unsupported DATABASE_URL_SYNC format: $DB_URL"
  exit 1
fi

DB_CREDS_HOST=${DB_URL_NO_SCHEME%%/*}
DB_NAME=${DB_URL_NO_SCHEME#*/}
DB_NAME=${DB_NAME%%\?*}
DB_USERPASS=${DB_CREDS_HOST%@*}
DB_HOSTPORT=${DB_CREDS_HOST#*@}
DB_USER=${DB_USERPASS%%:*}
DB_PASS=${DB_USERPASS#*:}
if [ "$DB_PASS" = "$DB_USERPASS" ]; then
  DB_PASS=""
fi
DB_HOST=${DB_HOSTPORT%%:*}
DB_PORT=${DB_HOSTPORT#*:}
if [ "$DB_PORT" = "$DB_HOSTPORT" ]; then
  DB_PORT="5432"
fi

mkdir -p "$DUMPS_DIR"
mkdir -p "$(dirname "$OUT_FILE")"

echo "[db-export] exporting local DB to: $OUT_FILE"
export_ok=0

if command -v docker >/dev/null 2>&1; then
  if { [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; } &&
    docker ps --format '{{.Names}}' | grep -qx 'naviq_postgres'; then
    echo "[db-export] using pg_dump from running container naviq_postgres"
    if docker exec -e PGPASSWORD="$DB_PASS" naviq_postgres \
      pg_dump -h localhost -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
      --format=custom --no-owner --no-privileges >"$OUT_FILE"; then
      export_ok=1
    fi
  fi

  if [ "$export_ok" -eq 0 ]; then
    DB_HOST_FROM_CONTAINER="$DB_HOST"
    if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
      DB_HOST_FROM_CONTAINER="host.docker.internal"
    fi
    echo "[db-export] using dockerized pg_dump (postgres:16-alpine)"
    if docker run --rm \
      -e PGPASSWORD="$DB_PASS" \
      -v "$(dirname "$OUT_FILE"):/dumps" \
      postgres:16-alpine \
      pg_dump -h "$DB_HOST_FROM_CONTAINER" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
      --format=custom --no-owner --no-privileges --file="/dumps/$(basename "$OUT_FILE")"; then
      export_ok=1
    fi
  fi
fi

if [ "$export_ok" -eq 0 ]; then
  echo "[db-export] docker export unavailable, fallback to local pg_dump"
  pg_dump \
    --format=custom \
    --no-owner \
    --no-privileges \
    --dbname="$DATABASE_URL_SYNC" \
    --file="$OUT_FILE"
fi

if [ ! -s "$OUT_FILE" ]; then
  rm -f "$OUT_FILE"
  echo "[db-export] export failed: dump file is empty"
  exit 1
fi

echo "[db-export] done"
ls -lh "$OUT_FILE"
