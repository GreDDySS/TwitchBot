import { Logger } from "@modules/Logger";
import { bot } from "@clients/Twitch";
import pc from 'picocolors';

export const handleError = (context: string, error: unknown, addtitionalInfo?: Record<string, any>) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : '';

  bot.Utils.logError(context, message, (error as Error).stack || " ")
}