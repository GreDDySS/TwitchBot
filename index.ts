import { Logger } from '@modules/Logger'
import { bot, initalize } from '@clients/Twitch'
import { query } from '@modules/Database'
import { initializeSTV } from '@clients/SevenTV';
import { Scheduler } from '@modules/Scheduler';
import { initializeTelegramBot } from '@clients/Telegram';
import pc from "picocolors";
import util from "util";
import { subscribeToStreamEvents } from '@clients/PubSub'
import { getListCelebration } from './utils'

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
    // Connect Database
    await query('SELECT 1');
    Logger.info(`${pc.green("[DATABASE]")} || Successfully connect Database! 🟢`);

    // Initialize Twitch
    await initalize()
    Logger.info(`${pc.green("[TWITCH]")} || Twitch started! 🟢`)

    // Initalize 7TV
    await initializeSTV()
    Logger.info(`${pc.green("[STV]")} || Successfully connect SevenTV 🟢`);

    // Initalize Telegram
    await initializeTelegramBot()
    Logger.info(`${pc.green("[TELEGRAM]")} || Telegram bot started! 🟢`);

    // Subscribe events stream PubSub
    await subscribeToStreamEvents()
    Logger.info(`${pc.green("[PUBSUB]")} || Subscribed to stream events! 🟢`);

    await getListCelebration()

    Logger.info(`${pc.green("[BOT]")} || Bot started! ⚡⚡⚡`)
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