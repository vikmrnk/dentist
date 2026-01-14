#!/bin/bash

# Скрипт для швидкого запуску всієї системи

echo "🚀 Запуск системи Реєстратура стоматології..."

# Перевірка наявності Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлений. Встановіть Docker Desktop."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не встановлений."
    exit 1
fi

# Запуск через Docker Compose
echo "📦 Запуск контейнерів..."
docker-compose up -d

echo ""
echo "✅ Система запущена!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 Frontend: http://localhost:5173"
echo "📍 Admin панель: http://localhost:8000/admin"
echo ""
echo "📝 Для створення суперкористувача виконайте:"
echo "   docker-compose exec backend python manage.py createsuperuser"
echo ""
echo "📝 Для створення груп виконайте:"
echo "   docker-compose exec backend python manage.py shell"
echo "   >>> from django.contrib.auth.models import Group"
echo "   >>> Group.objects.get_or_create(name='admin')"
echo "   >>> Group.objects.get_or_create(name='registrar')"
echo ""
echo "🛑 Для зупинки: docker-compose down"

