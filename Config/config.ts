import dotenv from 'dotenv';
import type {botConfig} from '../types'
import path from 'path'
dotenv.config();

export const config: botConfig = {
  twitch: {
    token: process.env.TTV_TOKEN!,
    bearer: process.env.TTV_BEARER!,
    clientID: process.env.TTV_CLIENTID!,
    secret: process.env.TTV_SECRET!,
    bot: process.env.BOT!,
    channels: [process.env.TTV_CHANNEL!],
    preifx: process.env.PREFIX!,
  },
  telegram: {
    token: process.env.TG_TOKEN!,
    adminChatId: process.env.TG_ADMIN_CHAT_ID!,
  },
  database: {
    host: process.env.DB_HOST!,
    name: process.env.DB_NAME!,
    port: parseInt(process.env.PORT!, 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
  },
  commandsPath: path.join(__dirname, '../Commands'),
}