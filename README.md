# GredDBot

GredDBot - это продвинутый Twitch бот с интеграцией Telegram, написанный на TypeScript с использованием runtime Bun. Бот предоставляет широкий функционал для модерации чата, сбора статистики и взаимодействия с пользователями.

## 🚀 Особенности

- Интеграция с Twitch IRC с поддержкой множества каналов
- Система команд с поддержкой алиасов и прав доступа
- Система cooldown для команд с настраиваемыми интервалами
- Продвинутая система логирования с использованием Winston
- Хранение данных в PostgreSQL с буферизацией статистики
- Поддержка эмотов через интеграцию с 7TV
- Система автоматических сообщений
- Интеграция с Telegram
- Гибкая система прав доступа (модератор, VIP, пользователь)
- Сбор и хранение статистики сообщений и команд
- Поддержка настраиваемых префиксов команд для каждого канала

## 📋 Требования

- [Bun](https://bun.sh) v1.1.42 или выше
- PostgreSQL
- Node.js для некоторых зависимостей
- Twitch Developer Application
- Telegram Bot Token (опционально)

## ⚙️ Установка

1. Клонируйте репозиторий:
```bash
git clone [url-репозитория]
cd greddbot
```

2. Установите зависимости:
```bash
bun install
```

3. Создайте файл `.env` и заполните необходимые переменные:
```env
# Twitch
TTV_TOKEN=oauth:your_token
TTV_BEARER=your_bearer_token
TTV_CLIENTID=your_client_id
TTV_SECRET=your_client_secret
BOT=bot_username
TTV_CHANNEL=main_channel
PREFIX=!

# Telegram
TG_TOKEN=your_telegram_token

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greddbot
DB_USER=postgres
DB_PASS=your_password
```

4. Настройте базу данных, создав необходимые таблицы:
- `Channels` - информация о каналах
- `Users` - информация о пользователях
- `Stats` - статистика сообщений и команд
- `LogError` - ошибки в работе бота
- `Anonnces` - сообщение при старте стрима и др

## 🚀 Запуск

```bash
# Запуск бота
bun run start

# Режим разработки
bun run dev

# Сборка проекта
bun run build

# Проверка кода
bun run lint

# Запуск тестов
bun run test
```

## 📦 Структура проекта

```
/project-root
├── clients/               # Клиенты для различных API
│   ├── Twitch.ts         # Twitch IRC клиент
│   ├── SevenTV.ts        # 7TV интеграция
│   ├── Telegram.ts       # Telegram бот
│   └── PubSub.ts         # Twitch PubSub
├── commands/             # Команды чата
├── config/              # Конфигурация
│   ├── config.ts        # Основные настройки
│   └── settings.ts      # Глобальные параметры
├── modules/             # Основные модули
│   ├── Command.ts       # Обработка команд
│   ├── Database.ts      # Работа с БД
│   ├── Logger.ts        # Система логирования
│   └── LoadCommand.ts   # Загрузка команд
├── database/           # Работа с базой данных
│   ├── Channel.ts      # Управление каналами
│   ├── Stats.ts        # Статистика
│   └── Users.ts        # Управление пользователями
└── utils/              # Вспомогательные функции
    ├── Cooldown.ts     # Система задержек
    └── parser.ts       # Парсинг данных
```

## 📝 Создание команд

Создайте новый файл в директории `commands/` со следующей структурой:

```typescript
import { cmdData, Bot } from '../types';

export default {
  name: 'commandname',     // Имя команды
  aliases: ['cmd', 'cm'],  // Алиасы
  description: 'Command description',
  cooldown: 5000,         // Задержка в мс
  permissions: ['user'],   // Права доступа
  active: true,           // Активна ли команда
  async execute(context: cmdData, client: Bot) {
    const { channel, user, message } = context;
    await client.CommandUtils.send(channel, `Hello, ${user.name}!`);
  }
};
```

## 🔒 Права доступа

Система поддерживает следующие уровни доступа:
- `broadcaster` - Владелец канала
- `moderator` - Модератор
- `vip` - VIP пользователь
- `chatter` - Обычный пользователь

## 📊 Статистика

Бот автоматически собирает статистику:
- Количество сообщений в канале
- Использование команд
- Активность пользователей

Данные буферизируются и сохраняются в базу данных каждые 5 секунд для оптимизации производительности.

## 🤝 Содействие

1. Сделайте форк репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте изменения в ваш форк (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

- Этот проект лицензирован под лицензией MIT. Подробности см. в файле [LICENSE](LICENSE).

## ⭐ Благодарности

- [@kararty/dank-twitch-irc](https://github.com/kararty/dank-twitch-irc) за отличную библиотеку для работы с Twitch IRC
- [Bun](https://bun.sh) за быстрый JavaScript runtime
