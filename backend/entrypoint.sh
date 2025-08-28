#!/bin/sh
#run the server
set -e

echo "waiting for db..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 1
done

echo "applying migrations..."
alembic upgrade head

echo "inserting data..."
python -m app.scripts.seed

echo "starting FastAPI server..."
: "${PORT:=10000}"
: "${WORKERS:=4}"
: "${THREADS:=1}"
: "${LOG_LEVEL:=info}"
: "${KEEPALIVE:=5}"
: "${TIMEOUT:=120}"

exec gunicorn \
  -k uvicorn.workers.UvicornWorker app.main:app \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WORKERS}" \
  --threads "${THREADS}" \
  --access-logfile "-" \
  --error-logfile "-" \
  --log-level "${LOG_LEVEL}" \
  --keep-alive "${KEEPALIVE}" \
  --timeout "${TIMEOUT}"