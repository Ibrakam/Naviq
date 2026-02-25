#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
REMOTE_HOST="${1:-}"
REMOTE_APP_DIR="${2:-}"
LOCAL_DUMP="${3:-}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SSH_OPTS="${SSH_OPTS:-}"

if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_APP_DIR" ]; then
  echo "Usage: ./deploy/db-push-to-server.sh <user@server> <remote_app_dir> [local_dump_file]"
  exit 1
fi

if [ -z "$LOCAL_DUMP" ]; then
  LOCAL_DUMP="$ROOT_DIR/deploy/dumps/naviq_local_${TIMESTAMP}.dump"
  "$ROOT_DIR/deploy/db-export-local.sh" "$LOCAL_DUMP"
fi

if [ ! -f "$LOCAL_DUMP" ]; then
  echo "[db-push] local dump not found: $LOCAL_DUMP"
  exit 1
fi

REMOTE_DUMP="/tmp/$(basename "$LOCAL_DUMP")"

echo "[db-push] uploading dump to $REMOTE_HOST:$REMOTE_DUMP"
# shellcheck disable=SC2086
scp $SSH_OPTS "$LOCAL_DUMP" "$REMOTE_HOST:$REMOTE_DUMP"

echo "[db-push] importing dump on server"
# shellcheck disable=SC2086
ssh $SSH_OPTS "$REMOTE_HOST" "cd '$REMOTE_APP_DIR' && chmod +x ./deploy/db-import-prod.sh && ./deploy/db-import-prod.sh '$REMOTE_DUMP' && rm -f '$REMOTE_DUMP'"

echo "[db-push] done"
