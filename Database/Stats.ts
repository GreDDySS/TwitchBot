import { bot } from "../Clients/Twitch"
import { query } from "../Modules/Database";
import { Logger } from "../Modules/Logger";
import type { channelStats } from "../types";
import pc from "picocolors"
import { uptime } from "../utils/Utils"
import { broadcast } from "../Modules/WebSocket"

const buffer: Record<string, channelStats> = {};
const flushInterval = 5000 // 5 seconds

setInterval(async () => {
  for (const channelID in buffer) {
    const { messages, commands } = buffer[channelID];
    try {
      await query(
        `
        INSERT INTO "Stats" ("channelID", "messages", "cmdLine", "timestamp")
        VALUES ($1, $2, $3, current_timestamp)
        ON CONFLICT ("channelID")
        DO UPDATE SET
          "messages" = "Stats"."messages" + $2,
          "cmdLine" = "Stats"."cmdLine" + $3,
          "timestamp" = current_timestamp
        `, [channelID, messages, commands]
      );

      // Logger.info(`${pc.green("[STATS]")} || Updated stats for ${pc.cyan(channelID)} (${messages} messages, ${commands} commands)`);
    } catch (e) {
      Logger.error(`${pc.red("[STATS]")} || Error updating stats for ${pc.cyan(channelID)}: ${e}`);
      bot.Utils.logError("STATS ERROR", (e as Error).message, (e as Error).stack || "");
    }

    delete buffer[channelID];
  }
}, flushInterval);

export class Stats {
  static async incrementMessage(channelID: string): Promise<void> {
    if (!buffer[channelID]) buffer[channelID] = { messages: 0, commands: 0 };
    buffer[channelID].messages++;
  }

  static async incrementCommand(channelID: string): Promise<void> {
    if (!buffer[channelID]) buffer[channelID] = { messages: 0, commands: 0 };
    buffer[channelID].commands++;
  }

  static async getStatistics(): Promise<string> {
    try {
      // Пример запросов к базе данных
      const totalChannels = await query(
        `SELECT COUNT(*) FROM "Channels" WHERE "ignore" = false`
      );
      const totalMessages = await query(
        `SELECT SUM(messages) AS Total FROM "Stats"`
      );
      const memoryUsage = process.memoryUsage();

      // Форматируем статистику для вывода
      const formattedStatistics = `
          📊 **Статистика Бота**:
          - 🟢 Активных каналов: ${totalChannels.rows[0].count}
          - ✉️ Сообщений обработано: ${totalMessages.rows[0].total || 0}
          - ⏳ Аптайм: ${uptime()} 
          - 💾 Использование памяти:
            - RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
            - Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
            - Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
          `;

      return formattedStatistics;
    } catch (error) {
      Logger.error(`${pc.red("[STATS]")} || Ошибка получения статистики: ${(error as Error).message}`);
      bot.Utils.logError("STATS ERROR TG", (error as Error).message, (error as Error).stack || "" )
      throw new Error("Ошибка получения статистики");
    }
  } 
}

export const sendStats = async (channelID: string, stats: {message: number, commands: number}) => {
  broadcast('stats', {channelID, stats});
}