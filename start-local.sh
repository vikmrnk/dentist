#!/bin/bash

# Скрипт для запуску проекту БЕЗ Docker
# Використовує SQLite замість MSSQL

echo "🚀 Запуск проекту БЕЗ Docker..."

# Перевірка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не знайдено! Встановіть Python 3.11 або новіший."
    exit 1
fi

# Перевірка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не знайдено! Встановіть Node.js."
    exit 1
fi

# Встановлення залежностей backend
echo "📦 Встановлення залежностей backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Створення віртуального середовища..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Налаштування змінних середовища для SQLite
export DB_ENGINE=sqlite
export DB_NAME=db.sqlite3
export DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
export DJANGO_DEBUG=True
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Міграції
echo "🔄 Запуск міграцій..."
python manage.py migrate --noinput

# Завантаження фікстур
echo "📥 Завантаження початкових даних..."
python manage.py loaddata apps/appointments/fixtures/appointment_statuses.json 2>/dev/null || echo "Фікстури вже завантажені або не знайдено"

# Запуск backend у фоні
echo "🔧 Запуск Django backend на http://localhost:8000..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd ../frontend

# Встановлення залежностей frontend
echo "📦 Встановлення залежностей frontend..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Запуск frontend
echo "🎨 Запуск React frontend на http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Проект запущено!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Для зупинки натисніть Ctrl+C"

# Очікування сигналу завершення
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

