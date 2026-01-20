# Реєстратура стоматології

Повноцінний веб-застосунок для управління реєстратурою стоматологічної клініки.

## Технології

- **Backend**: Django + Django REST Framework + MSSQL (Azure SQL Edge у Docker)
- **Frontend**: React (Vite) + React Router + Tailwind CSS
- **Auth**: JWT (djangorestframework-simplejwt)

## Передумови

- Docker + Docker Compose (рекомендовано)
- (опційно) Python 3.10+, Node.js 18+ якщо запускати без Docker

## 🚀 Швидкий старт (Docker - рекомендується)

Найпростіший спосіб запустити всю систему однією командою:

```bash
# Запуск всієї системи
docker-compose up -d

# Або використовуючи скрипт:
# На macOS/Linux:
./start.sh

# На Windows:
start.bat
```

Система буде доступна:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin панель**: http://localhost:8000/admin

### Перший запуск

```bash
# 1. Створіть суперкористувача (якщо потрібно)
docker-compose exec backend python manage.py createsuperuser

# 2. Створіть групи для ролей (якщо потрібно)
docker-compose exec backend python manage.py shell
# Виконайте в shell:
# from django.contrib.auth.models import Group
# Group.objects.get_or_create(name='admin')
# Group.objects.get_or_create(name='registrar')
```

### Корисні команди

```bash
# Перегляд логів
docker-compose logs -f

# Зупинка системи
docker-compose down

# Перезапуск
docker-compose restart

# Перебудова контейнерів
docker-compose build
```

---

## 📋 Ручний запуск (без Docker)

> Рекомендація: користуйтеся Docker. Ручний запуск потрібен лише для локальної розробки без контейнерів.

### 1. Backend (Django + MSSQL)

1) Підніміть MSSQL локально (приклад через Docker):
```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrongPassword123!' -p 1433:1433 -d mcr.microsoft.com/azure-sql-edge:latest
```
⚠️ **Важливо:** Замініть `YourStrongPassword123!` на свій безпечний пароль!

2) Налаштуйте середовище:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3) Створіть `.env` файл:
```bash
cp env.example .env
```
Відредагуйте `backend/.env` та вкажіть свої значення (дивіться `backend/env.example` для прикладу).

⚠️ **Безпека:** Ніколи не комітьте `.env` файл у Git! Він вже доданий до `.gitignore`.

4) Створіть базу даних (якщо потрібно):
```bash
# Підключіться до MSSQL та створіть базу
docker exec -it <container_id> /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -Q "CREATE DATABASE dentistry"
```

5) Ініціалізуйте дані:
```bash
python manage.py migrate
python manage.py loaddata apps/appointments/fixtures/appointment_statuses.json
python manage.py create_test_data    # опційно, щоб мати тестові записи
python manage.py createsuperuser     # опційно
```

6) Запуск:
```bash
python manage.py runserver
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install   # або pnpm install
npm run dev   # або pnpm dev
```

Опційно створіть `.env` у `frontend/` (якщо потрібно змінити API URL):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```
⚠️ **Безпека:** `.env` файли автоматично ігноруються Git.

Frontend: **http://localhost:5173**

## Використання

1. Відкрийте браузер і перейдіть на `http://localhost:5173`
2. Увійдіть з обліковими даними суперкористувача, якого ви створили
3. Для доступу до функцій адміністратора, користувач повинен бути в групі `admin`
4. Для доступу до функцій реєстратора, користувач повинен бути в групі `registrar`

## API Endpoints

### Auth
- `POST /api/auth/login/` - Вхід
- `POST /api/auth/refresh/` - Оновлення токену
- `GET /api/auth/me/` - Поточний користувач

### Patients
- `GET /api/patients/` - Список пацієнтів
- `POST /api/patients/` - Створити пацієнта
- `GET /api/patients/{id}/` - Отримати пацієнта
- `PATCH /api/patients/{id}/` - Оновити пацієнта
- `DELETE /api/patients/{id}/` - Видалити пацієнта

### Doctors
- `GET /api/doctors/` - Список лікарів
- `POST /api/doctors/` - Створити лікаря (тільки admin)
- `GET /api/doctors/{id}/` - Отримати лікаря
- `PATCH /api/doctors/{id}/` - Оновити лікаря (тільки admin)
- `DELETE /api/doctors/{id}/` - Видалити лікаря (тільки admin)

### Appointments
- `GET /api/appointments/` - Список записів
- `POST /api/appointments/` - Створити запис
- `GET /api/appointments/{id}/` - Отримати запис
- `PATCH /api/appointments/{id}/` - Оновити запис
- `DELETE /api/appointments/{id}/` - Видалити запис

### Schedule
- `GET /api/schedule/?date=YYYY-MM-DD&doctor_id=...` - Розклад

### Reports
- `GET /api/reports/daily/?date=YYYY-MM-DD` - Записи за день
- `GET /api/reports/doctor-daily/?date=YYYY-MM-DD&doctor_id=...` - Записи по лікарю за день
- `GET /api/reports/cancelled/?date=YYYY-MM-DD` - Скасовані за день

## Структура проєкту

```
dentist/
├── backend/              # Django backend
│   ├── apps/
│   │   ├── users/       # Автентифікація та ролі
│   │   ├── patients/    # Пацієнти
│   │   ├── doctors/     # Лікарі
│   │   └── appointments/# Записи, розклад, звіти
│   ├── config/          # Налаштування Django
│   └── manage.py
│
└── frontend/            # React frontend
    └── src/
        ├── api/         # API клієнти
        ├── auth/        # Автентифікація
        ├── components/  # UI компоненти
        ├── pages/       # Сторінки
        └── router.tsx   # Маршрутизація
```

## Розробка

### Backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm run dev  # або pnpm dev
```


