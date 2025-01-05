import { query } from "./Database";
import { Logger } from "./Logger";
import { logError } from "../utils/Utils";
import type { channelLogs } from "../types";
import pc from "picocolors";

const buffer: Record<string, channelLogs> = {};
const flashInterval = 5000;

/**
 * Create table logs for channel
 * @param channelID ID channel
 */
export const createChannelLogsTable = async (channelID: string): Promise<void> => {
  const queryText = `
    CREATE TABLE "Logs"."сhannel_${channelID}" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    badges TEXT,
    color VARCHAR(25),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  try {
    await query(queryText);
    Logger.info(`${pc.green("[CHANNEL LOG]")} || The log table for the channel ${channelID} has been created or already exists`);
  } catch (error) {
    Logger.error(`${pc.red("[CHANNEL LOG]")} ||  Error creating log table for channel ${channelID}: ${(error as Error).message}`);
    logError("DB CHANNEL", (error as Error).message, (error as Error).stack || "");
    throw error;
  }
}

export const logMessage = async (channelID: string, username: string, message: string, color: string, badge?: string): Promise<void> => {
  if (!buffer[channelID]) {
    buffer[channelID] = { messages: []};
  }
  buffer[channelID].messages.push({username, message, color, badge});
  Logger.debug(`${pc.yellow("[LOG MESSAGE]")} || A message from ${username} has been added to the buffer for channel  ${channelID}`);
}

const flushBuffer = async (): Promise<void> => {
  for (const channelID in buffer) {
    const logs = buffer[channelID].messages;
    if (logs.length === 0) continue;

    const queryText = `
      INSERT INTO "Logs"."сhannel_${channelID}" (username, message, color, badges)
      VALUES ${logs.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(", ")}
    `;

    const values = logs.flatMap((log) => [
      log.username,
      log.message,
      log.color,
      log.badge || null,
    ]);
    
    try {
      await query(queryText, values);
      //Logger.info(`${pc.green("[LOG BUFFER MESSAGE]")} || The message buffer for channel ${channelID} has been successfully saved to the database.`);
    } catch (error) {
      Logger.error(`${pc.red("[LOG BUFFER MESSAGE]")} || Error writing message buffer to channel ${channelID}: ${(error as Error).message}`);
      logError("LOG BUFFER MESSAGE", (error as Error).message, (error as Error).stack || "")
    }

    delete buffer[channelID]
  }
}

setInterval(flushBuffer, flashInterval)