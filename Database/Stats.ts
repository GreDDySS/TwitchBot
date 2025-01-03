import { query } from "../Modules/Database";
import { Logger } from "../Modules/Logger";
import type { channelStats } from "../types";
import pc from "picocolors"

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

      Logger.info(`${pc.green("[STATS]")} || Updated stats for ${pc.cyan(channelID)} (${messages} messages, ${commands} commands)`);
    } catch (e) {
      Logger.error(`${pc.red("[STATS]")} || Error updating stats for ${pc.cyan(channelID)}: ${e}`);
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
}