# Twitch Bot

Twitch Bot на JavaScript для взаимодействия с чатом Twitch.

## Описание

Этот бот предназначен для работы с чатом Twitch. Он позволяет автоматизировать различные задачи, выполнение команд чата. Бот также ведёт логирование сообщений и тесно интегрирован с базой данных, куда отправляются необходимые данные. Все сообщения можно будет увидеть на сайте [greddbot.ru](http://greddbot.ru).

## Начало работы

Следуйте этим инструкциям, чтобы настроить и запустить проект на своем локальном компьютере.

### Предварительные требования

- Node.js (рекомендуется последняя LTS версия)
- npm (устанавливается вместе с Node.js)

### Установка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/GreDDySS/TwitchBot.git
   ```

2. Перейдите в директорию проекта:
   ```bash
   cd TwitchBot
   ```

3. Установите зависимости:
   ```bash
   npm install
   ```

## Настройка

Создайте файл `.env` в корне проекта и добавьте в него следующие переменные:

```
USERNAME=""     # bot's username
PASSWORD=""     # bot's "oauth:token"
BEARER=""       # twitch API 30 symbols without bearer:
CLIENTID=""     # bot's client id
TOKEN=""        # bot's token without oauth:
BOTID=""        # bot's id

PREFIX="`"      # 1 (or more) chars - command prefix
OWNER= ""       # owner's name

TG_TOKEN=""     # telegram oauth get from @BotFather 

DB_HOST=""      # db hosting
DB_NAME=""      # db name database
DB_PORT=""      # db port
DB_USER=""      # db username
DB_PASS=""      # db password
```

### Получение OAuth токена

Для получения OAuth токена перейдите по [этой ссылке](https://twitchapps.com/tmi/) и следуйте инструкциям.

## Запуск

Для запуска бота используйте команду:

```bash
npm start
```

## Использование

Бот поддерживает следующие команды:

- TF

## Логирование

Все сообщения, отправленные в чат, будут логироваться и сохраняться в базе данных. Просмотреть сообщения можно на сайте [greddbot](https://greddbot.vercel.app).

## Содействие

Если вы хотите внести свой вклад в проект, пожалуйста, создайте форк репозитория, внесите изменения и отправьте pull request.

## Лицензия

Этот проект лицензирован под лицензией MIT. Подробности см. в файле [LICENSE](LICENSE).

