#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="$ROOT_DIR/deploy/.env"

cd "$ROOT_DIR"

docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" down
