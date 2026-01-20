#!/bin/bash

# Скрипт для запуску тільки backend

cd backend

# Активація віртуального середовища
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Віртуальне середовище не знайдено! Спочатку запустіть start-local.sh"
    exit 1
fi

# Налаштування змінних середовища для SQLite
export DB_ENGINE=sqlite
export DB_NAME=db.sqlite3
export DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
export DJANGO_DEBUG=True
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Запуск
python manage.py runserver 0.0.0.0:8000

