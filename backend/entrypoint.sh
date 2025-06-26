#!/bin/sh

echo "waiting for db..."
until pg_isready -h db -U postgres; do
  sleep 1
done

echo "applying migrations..."
flask db upgrade

echo "inserting data..."
python seed.py

echo "initializing Flask server..."
exec flask run --host=0.0.0.0 --port=5000