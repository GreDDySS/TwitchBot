# greddbot

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```python
/project-root
├── clients/               // Модули для работы с API
│   ├── Twitch.ts          // Клиент для подключения к Twitch IRC
│   ├── SevenTV.ts         // Клиент для работы с API 7TV
│   ├── Telegram.ts        // Клиент для Telegram-бота
│   └── PubSub.ts          // Подключение к Twitch PubSub
├── commands/              // Команды для чата
│   ├── ping.ts            // Пример команды
│   └── help.ts            // Пример команды
├── config/                // Конфигурация проекта
|   ├── config.ts          // Подключение .env и прасваивание имени
│   └── settings.ts        // Глобальные настройки
├── modules/               // Функциональные модули
│   ├── Command.ts         // Функции для отправки сообщений в Twitch-канал с обработкой ошибок и проверкой ограничений. Экспорт send. sendError, sendCommand
│   ├── Database.ts        // Подключение к PostgreSQL
│   ├── Logger.ts          // Логирование через Winston
|   ├── LoadCommand.ts     // Загрузка и регистрация команд
│   └── Scheduler.ts       // Планировщик задач (например, авто-сообщения)
├── database/
|   ├── Channel.ts         // Запросы к базе данных getByID, GetByName, GetJoiable, GetListenable, getSevenTV, getChannelLogging
|   ├── Stats.ts           // Запросы к базе данных к таблице stats
|   └── Users.ts           // Запросы к базе данных к таблице users
├── utils/                 // Вспомогательные функции
│   ├── utils.ts           // Универсальные утилиты
│   ├── parser.ts          // Парсинг данных
│   ├── validator.ts       // Валидация данных
│   └── cooldown.ts        // Ограничитель запросов (cooldown команд)
├── other/                 // Служебные данные
│   └── celebration.json   // Файл с массивом праздников
├── .env                   // Файл с переменными окружения
├── .gitignore             // Игнорируемые файлы
├── bunfig.toml            // Конфигурация Bun
├── tsconfig.json          // Конфигурация TypeScript
├── types.d.ts             // Описание типов данных
├── package.json           // Информация о проекте
└── index.ts               // Точка входа
```