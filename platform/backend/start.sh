#!/usr/bin/env sh
set -eu

PORT="${PORT:-8000}"

if [ "${RUN_MIGRATIONS_ON_START:-false}" = "true" ]; then
  alembic upgrade head
fi

if [ "${RUN_DEMO_SEED_ON_START:-false}" = "true" ]; then
  python -m app.scripts.seed_demo
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
