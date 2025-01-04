import { Logger } from './Modules/Logger'
import { bot, initalize } from './Clients/Twitch'
import { query } from './Modules/Database'
import { initializeSTV } from './Clients/SevenTV';
import { Scheduler } from './Modules/Scheduler';
import { initializeTelegramBot } from './Clients/Telegram';
import pc from "picocolors";
import util from "util";

Scheduler.addTask({
  name: "UpdateCelebrations",
  schedule: "0 */2 * * *", // Каждые 2 часа
  task: async () => {
    const { getListCelebration } = await import("./utils/Parser");
    await getListCelebration();
  },
});

(async () => {

  try {
    await query('SELECT 1');
    Logger.info(`${pc.green("[DATABASE]")} || Successfully connect Database!`);
    await initalize()
    Logger.info(`${pc.green("[TWITCH]")} || Twitch started!`)
    await initializeSTV()
    await initializeTelegramBot()
    Logger.info(`${pc.green("[BOT]")} || Bot started!`)
    console.log("<"+"=".repeat(50)+ ">")
  } catch (error) {
    Logger.error(`${pc.red("[BOT]")} || Failed start bot:`, error)
    throw error;
  };

})();

process
.on('unhandledRejection', async (reason, promise) => {
    bot.Utils.logError("UnhandledRejection", util.inspect(promise), util.inspect(reason))
    return Logger.error(`${pc.red('[UnhandledRejection]')} || ${reason}`);
})
.on('uncaughtException', async (err) => {
    bot.Utils.logError("UnhandledRejection", err.message, err.stack || "")
    Logger.error(`${pc.red('[UncaughtException]')} || ${err.message}`);
    return process.exit(0);
});