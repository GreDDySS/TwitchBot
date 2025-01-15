import { Logger } from "@modules/Logger";
import { bot } from "@clients/Twitch";
import pc from 'picocolors';

export const handleError = (context: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  Logger.error(`${pc.red(context)}: || ${message}`);
  bot.Utils.logError(context, message, (error as Error).stack || " ")
}