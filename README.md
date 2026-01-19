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

## 📋 Ручний запуск (без Docker, детально)

> Якщо Docker недоступний (наприклад, Windows 32-bit), можна запустити локально. Рекомендація: для продакшена або демо замовнику з Windows 32-bit — використовуйте SQLite або віддалений MSSQL (Azure SQL/VM).

### Варіант A. Backend на SQLite (найпростіший, без окремої БД)
1) Вимоги: Python 3.10+ (для Windows 32-bit — відповідний інсталятор).  
2) Створіть віртуальне середовище і встановіть залежності:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   pip install -r backend/requirements.txt
   ```
3) Налаштуйте env для SQLite:
   ```bash
   cp backend/env.example backend/.env
   ```
   У `backend/.env` встановіть:
   ```
   DB_ENGINE=sqlite
   DB_NAME=db.sqlite3       # можна залишити так
   DJANGO_DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ORIGINS=http://localhost:5173
   ```
4) Ініціалізуйте БД:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py loaddata apps/appointments/fixtures/appointment_statuses.json  # опційно
   python manage.py create_test_data  # опційно, тестові записи
   python manage.py createsuperuser   # опційно
   ```
5) Запуск:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Варіант B. Backend з MSSQL без Docker
- Локально на Windows 32-bit сучасний SQL Server не підтримується, тож використовуйте віддалений MSSQL (Azure SQL або SQL Server на сервері/VM).
- У `backend/.env` задайте:
  ```
  DB_ENGINE=mssql
  DB_NAME=...
  DB_USER=...
  DB_PASSWORD=...
  DB_HOST=...
  DB_PORT=1433
  DB_DRIVER="ODBC Driver 18 for SQL Server"
  DB_EXTRA_PARAMS=TrustServerCertificate=yes
  ALLOWED_HOSTS=localhost,127.0.0.1
  CORS_ORIGINS=http://localhost:5173
  ```
- Потрібно встановити Microsoft ODBC Driver 18 для SQL Server під вашу ОС.
- Далі:
  ```bash
  cd backend
  python manage.py migrate
  python manage.py runserver 0.0.0.0:8000
  ```

### Frontend (React + Vite)
1) Встановіть Node.js (для Windows 32-bit — відповідний інсталятор; якщо LTS недоступний, Node 16+ має працювати).  
2) У `frontend`:
   ```bash
   npm install
   echo VITE_API_BASE_URL=http://localhost:8000/api > .env   # або URL вашого бекенду
   npm run dev -- --host --port 5173
   ```
3) Відкрити: `http://localhost:5173`

### Швидкий чекліст (локально без Docker)
- Backend: активована venv, `backend/.env` із `DB_ENGINE=sqlite` (або MSSQL параметри, якщо віддалений сервер).  
- Frontend: `frontend/.env` з `VITE_API_BASE_URL=<url>/api`.  
- Запускати бекенд перед фронтендом.  
- Для Windows 32-bit: використовуйте SQLite або віддалений MSSQL; локальний SQL Server x64/ARM образ не запуститься.

### Часті проблеми (локально)
- **Немає залежностей**: переконайтеся, що venv активна і `pip install -r backend/requirements.txt` виконано.  
- **SQLite міграції падають**: видаліть `backend/db.sqlite3` і повторіть `python manage.py migrate`.  
- **MSSQL SSL/driver**: перевірте встановлення ODBC Driver 18, задайте `DB_EXTRA_PARAMS=TrustServerCertificate=yes`.  
- **CORS у браузері**: перевірте `CORS_ORIGINS` і `ALLOWED_HOSTS` у `.env`.  
- **Node не стає**: для старих Windows ставте 32-bit дистрибутив Node 16/18; якщо зовсім не ставиться, можна зібрати фронтенд на іншій машині і віддати статичні файли.

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


