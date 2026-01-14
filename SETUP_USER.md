# Налаштування користувача для входу

## Швидкий спосіб (через Docker)

### 1. Створіть суперкористувача

```bash
docker-compose exec backend python manage.py createsuperuser
```

Введіть:
- **Username**: `admin` (або будь-яке ім'я)
- **Email**: (можна залишити порожнім або ввести email)
- **Password**: (введіть пароль, наприклад `admin123`)
- **Password (again)**: (підтвердіть пароль)

### 2. Створіть групи для ролей

```bash
docker-compose exec backend python manage.py shell
```

Потім в Python shell виконайте:

```python
from django.contrib.auth.models import Group, User

# Створіть групи
admin_group, _ = Group.objects.get_or_create(name='admin')
registrar_group, _ = Group.objects.get_or_create(name='registrar')

# Призначте користувача до групи admin
user = User.objects.get(username='admin')  # замініть на ваш username
user.groups.add(admin_group)

# Перевірте
print(f"Користувач {user.username} має ролі: {[g.name for g in user.groups.all()]}")

exit()
```

### 3. Увійдіть в систему

1. Відкрийте http://localhost:5173
2. Введіть ваш **username** та **password**
3. Натисніть "Увійти"

## Альтернатива: Через Admin панель

1. Відкрийте http://localhost:8000/admin
2. Увійдіть з обліковими даними суперкористувача
3. Перейдіть в **Groups** → **Add group**
   - Створіть групу `admin`
   - Створіть групу `registrar`
4. Перейдіть в **Users** → Відкрийте вашого користувача
5. В розділі **Groups** призначте користувача до групи `admin`

## Важливо

- **Група `admin`** - повний доступ до всіх функцій (включаючи управління лікарями)
- **Група `registrar`** - доступ до пацієнтів, записів та звітів (без управління лікарями)

