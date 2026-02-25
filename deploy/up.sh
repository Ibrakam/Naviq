#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="$ROOT_DIR/deploy/.env"
ENV_EXAMPLE="$ROOT_DIR/deploy/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  echo "[deploy] deploy/.env not found, creating from example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "[deploy] edit deploy/.env and re-run"
  exit 1
fi

cd "$ROOT_DIR"

echo "[deploy] pulling/building images"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" pull || true
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" build --pull

echo "[deploy] starting services"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d

echo "[deploy] done"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps
