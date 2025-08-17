#!/bin/sh
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
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:10000 app.main:app
