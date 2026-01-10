# GreDDBot V2 🤖

A modern, high-performance Twitch Bot rewritten from scratch using **Bun**, **Twurple**, and **React Ink** (TUI).

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-Bun_Typescript_Prisma-blue)

## ✨ Key Features

- **⚡ Blazing Fast**: Powered by [Bun](https://bun.sh) runtime.
- **🖥️ TUI Dashboard**: Real-time console interface with [Ink](https://github.com/vadimdemedes/ink) showing uptime, stats, and logs.
- **🔐 Smart Auth**: Built-in local OAuth server. No need to manually generate tokens—just log in via browser once.
- **🐘 Database**: Fully typed [Prisma Client](https://www.prisma.io/) with PostgreSQL (Supabase support).
- **🛡️ Secure**: Environment variables validaton via [Zod](https://zod.dev).
- **🛠️ Modular**: Clean architecture with separated Command Handlers, Events, and Services.

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Twitch API**: `@twurple/auth`, `@twurple/chat`, `@twurple/api`
- **Database**: PostgreSQL + Prisma ORM 7
- **UI**: Ink (React for CLI)
- **CLI Args**: Meow
- **Logging**: Winston

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed.
- PostgreSQL Instance (e.g., Supabase or local).
- Twitch Application created in [Twitch Dev Console](https://dev.twitch.tv/console).
  - **Redirect URI**: `http://localhost:3000/auth`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd GreDDBot
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   # Twitch API
   TWITCH_CLIENT_ID=your_client_id
   TWITCH_CLIENT_SECRET=your_client_secret
   TWITCH_CHANNELS=channel1,channel2
   BOT_USERNAME=YourBotName
   BOT_ID=123456789

   # Database (Supabase Transaction Mode suggested)
   DB_URL="postgres://user:pass@host:5432/db"

   # Telegram (Optional)
   TELEGRAM_TOKEN=...
   TELEGRAM_ADMIN_ID=...
   ```

4. **Setup Database**
   Push the schema to your database:
   ```bash
   bunx prisma db push
   ```

### 🏃‍♂️ Running the Bot

**Development Mode** (Hot Reload):
```bash
bun run dev
```

**Production Mode** (TUI Enabled):
```bash
bun start
```

**Headless Mode** (No UI, best for Docker/Logs):
```bash
bun run start:headless
```

## 📂 Project Structure

```
├── Auth/           # OAuth logic & Token management
├── Clients/        # Twurple instances (Chat, API)
├── Config/         # Zod schemas for .env
├── Database/       # Prisma Client wrapper & Repositories
├── Handlers/       # Command parsing & execution logic
├── Interfaces/     # Types & Interfaces
├── ui/             # React Ink components (Dashboard, Logs)
├── Utils/          # Loggers, Senders, Stores
├── commands/       # Command files (e.g. ping.ts)
└── index.tsx       # Entry point
```

## 🎮 Writing Commands

Create a file in `commands/` (e.g. `hello.ts`):

```typescript
import { ICommand } from "../Interfaces/types";

export default {
    name: "hello",
    aliases: ["hi"],
    description: "Says hello back",
    permission: "chatter", // chatter | mod | broadcaster
    cooldown: 5,

    async execute({ reply, user }) {
        await reply(`Hello, @${user}! 👋`);
    }
} as ICommand;
```

## 📄 License
MIT
