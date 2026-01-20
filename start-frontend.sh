#!/bin/bash

# Скрипт для запуску тільки frontend

cd frontend

# Перевірка node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Встановлення залежностей..."
    npm install
fi

# Запуск
npm run dev

