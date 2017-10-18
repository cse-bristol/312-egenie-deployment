#!/bin/sh

echo "Starting"

while ! nc -z db 3306; do sleep 3; done
echo "Database Started"

echo "Creating Database"
/app/manage.py collectstatic --noinput
/app/manage.py migrate --noinput

uwsgi --socket :5000 --wsgi-file /app/egenie/wsgi.py --master --processes 4 --threads 2 --chdir /app