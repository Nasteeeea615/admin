# Админ-панель Септик Сервис

Веб-приложение для управления системой заказов септик-услуг.

## Технологии

- React 18 с TypeScript
- Material-UI (MUI) для UI компонентов
- React Router для навигации
- Axios для HTTP запросов
- Recharts для графиков и аналитики

## Установка

```bash
npm install
```

## Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте URL API в `.env`:

```
REACT_APP_API_URL=http://localhost:3000/api
```

## Запуск

### 🧪 Режим тестирования с мок-данными (рекомендуется)

Админ-панель настроена для работы с тестовыми данными БЕЗ backend:

```bash
npm start
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000)

**Тестовые данные для входа:**
- Телефон: `+79999999999`
- Пароль: `admin123`

📖 **Подробная инструкция:** см. [QUICK_START.md](QUICK_START.md) или [TESTING.md](TESTING.md)

### Режим разработки с backend

Для работы с реальным backend измените импорты в файлах страниц:
```typescript
// Замените
import mockApi from '../services/mockApi';
// На
import api from '../services/api';
```

### Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `build/`

## Структура проекта

```
admin/
├── public/              # Статические файлы
├── src/
│   ├── components/      # Переиспользуемые компоненты
│   │   ├── Layout.tsx           # Основной layout с навигацией
│   │   ├── DataTable.tsx        # Компонент таблицы
│   │   └── ConfirmDialog.tsx    # Модальное окно подтверждения
│   ├── pages/           # Страницы приложения
│   │   ├── LoginPage.tsx        # Страница входа
│   │   ├── DashboardPage.tsx    # Главная страница
│   │   ├── OrdersPage.tsx       # Управление заказами
│   │   ├── UsersPage.tsx        # Управление пользователями
│   │   ├── PaymentsPage.tsx     # Управление платежами
│   │   ├── SupportPage.tsx      # Система поддержки
│   │   └── AnalyticsPage.tsx    # Аналитика
│   ├── services/        # Сервисы
│   │   └── api.ts               # API клиент
│   ├── App.tsx          # Главный компонент
│   └── index.tsx        # Точка входа
├── .env.example         # Пример конфигурации
└── package.json
```

## Функциональность

### Реализовано

- ✅ Авторизация администратора
- ✅ Layout с боковой навигацией
- ✅ Дашборд с основными метриками
- ✅ Базовые компоненты (таблица, модальные окна)
- ✅ Роутинг и защищенные маршруты

### В разработке

- 🚧 Управление заказами
- 🚧 Управление пользователями
- 🚧 Управление платежами
- 🚧 Система поддержки
- 🚧 Аналитика и отчеты

## Авторизация

Для входа в админ-панель используйте учетные данные администратора:

- Номер телефона: (будет настроено на backend)
- Пароль: (будет настроено на backend)

## API Endpoints

Админ-панель использует следующие API endpoints:

### Авторизация
- `POST /api/auth/admin/login` - Вход администратора

### Заказы
- `GET /api/admin/orders` - Получить все заказы
- `PUT /api/admin/orders/:id` - Обновить заказ
- `POST /api/admin/orders/:id/assign` - Назначить исполнителя

### Пользователи
- `GET /api/admin/users` - Получить всех пользователей
- `GET /api/admin/users/:id` - Получить пользователя
- `PUT /api/admin/users/:id/block` - Заблокировать пользователя
- `PUT /api/admin/users/:id/verify` - Верифицировать исполнителя

### Платежи
- `GET /api/admin/payments` - Получить все платежи
- `POST /api/admin/payments/:id/refund` - Возврат платежа

### Поддержка
- `GET /api/admin/tickets` - Получить все тикеты
- `GET /api/admin/tickets/:id` - Получить тикет
- `POST /api/admin/tickets/:id/reply` - Ответить на тикет
- `PUT /api/admin/tickets/:id/status` - Изменить статус тикета

### Аналитика
- `GET /api/admin/analytics` - Получить метрики

## Разработка

### Добавление новой страницы

1. Создайте компонент страницы в `src/pages/`
2. Добавьте маршрут в `src/App.tsx`
3. Добавьте пункт меню в `src/components/Layout.tsx`

### Стилизация

Используйте Material-UI компоненты и систему стилей:

```tsx
import { Box, Typography } from '@mui/material';

<Box sx={{ p: 2, backgroundColor: 'primary.main' }}>
  <Typography variant="h4">Заголовок</Typography>
</Box>
```

### Работа с API

Используйте сервис `api` для всех запросов:

```tsx
import api from '../services/api';

const fetchData = async () => {
  try {
    const data = await api.get('/admin/orders');
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Безопасность

- Все маршруты защищены проверкой токена
- Токен хранится в localStorage
- При ошибке 401 происходит автоматический редирект на страницу входа
- Используйте HTTPS в продакшене

## Производительность

- Используйте React.memo для оптимизации компонентов
- Lazy loading для страниц
- Пагинация для больших списков
- Кэширование данных где возможно

## Тестирование

```bash
npm test
```

## Деплой

1. Соберите проект:
```bash
npm run build
```

2. Разверните содержимое папки `build/` на веб-сервере

3. Настройте nginx или другой веб-сервер для SPA:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Поддержка

При возникновении проблем обратитесь к документации:
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
