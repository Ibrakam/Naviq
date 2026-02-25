#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BRANCH="${1:-main}"

cd "$ROOT_DIR"

echo "[deploy] updating git branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] rebuilding and restarting services"
"$ROOT_DIR/deploy/up.sh"
