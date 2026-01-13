import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const configSchema = z.object({
  twitch: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
    botUsername: z.string(),
    botId: z.int(),
    owner: z.string(),
    prefix: z.string(),
    channels: z.string().transform((str) => str.split(",").map((c) => c.trim())),
  }),
  db: z.object({
    url: z.string(),
  }),
  redis: z.object({
    url: z.string(),
  }),
  telegram: z.object({
    token: z.string(),
    adminId: z.string(),
  }),
});

const env = configSchema.parse({
  twitch: {
    clientId: process.env.TWITCH_CLIENTID,
    clientSecret: process.env.TWITCH_SECRET,
    accessToken: process.env.TWITCH_TOKEN,
    refreshToken: process.env.TWITCH_REFRESH,
    botUsername: process.env.BOT,
    botId: parseInt(`${process.env.BOT_ID}`),
    owner: process.env.OWNER,
    prefix: process.env.PREFIX,
    channels: process.env.CHANNELS,
  },
  db: {
    url: process.env.DB_URI,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  telegram: {
    token: process.env.TG_TOKEN,
    adminId: process.env.TG_ADMIN_CHAT_ID,
  },
});
export default env;