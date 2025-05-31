# Freelex

Веб-додаток для організації фокус-сесій за технікою Помодоро.

## ✨ Особливості

- 🔐 Реєстрація та авторизація користувачів
- 📅 Створення та управління сесіями фокусування
- 👥 Приєднання до сесій інших користувачів
- ⏱️ Налаштування часу роботи та перерв
- 📱 Адаптивний дизайн для всіх пристроїв

## 🛠 Технічний стек

- Frontend:
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (Vanilla)
- Backend:
  - PHP
  - MySQL
- Інструменти:
  - Font Awesome для іконок
  - Google Fonts (Poppins)

## 📡 API Endpoints

### Аутентифікація
- `POST /api.php?action=login` - Вхід в систему
- `POST /api.php?action=register` - Реєстрація нового користувача

### Сесії
- `GET /api.php?action=sessions` - Отримання всіх сесій
- `GET /api.php?action=fetchSessions` - Отримання сесій з урахуванням учасника
- `POST /api.php?action=createsession` - Створення нової сесії
- `POST /api.php?action=joinsession` - Приєднання до сесії
- `POST /api.php?action=editSession` - Редагування сесії
- `GET /api.php?action=session&id={id}` - Отримання деталей сесії

### Профіль
- `GET /api.php?action=profile&id={id}` - Отримання профілю користувача

## 📁 Структура проекту

```
freelex/
├── api/
│   ├── api.php           # API endpoints
│   └── database.sql      # Структура бази даних
├── src/
│   ├── css/
│   │   └── styles.css    # Стилі
│   └── js/
│       └── app.js        # JavaScript код
├── index.html            # Головна сторінка
└── README.md            # Документація
```

## 🚀 Встановлення

1. Клонуйте репозиторій:
```bash
git clone https://github.com/labfunny/freelex.git
```

2. Налаштуйте базу даних:
- Створіть нову базу даних MySQL
- Імпортуйте структуру з `api/database.sql`
- Оновіть дані підключення в `api/api.php`

3. Налаштуйте веб-сервер:
- Налаштуйте Apache/Nginx для роботи з PHP
- Вкажіть кореневу директорію на папку проекту

4. Відкрийте проект у браузері:
```
http://localhost/freelex
```

## 🔒 Безпека

- Паролі хешуються за допомогою `password_hash()`
- Використовується PDO для безпечних запитів
- Валідація всіх вхідних даних
- CORS налаштування для API

## 📝 Ліцензія

MIT License. Дивіться файл `LICENSE` для деталей.

## 👨‍💻 Автор

Danil - [GitHub](https://github.com/labfunny)

---
