const util = require('util');
const pc = require('picocolors');
const fs = require('fs').promises;


global.bot = {}


bot.Config = require("./utils/Config")
bot.DB = {db} = require("./modules/Database")
bot.Logger = require("./utils/Winston")
bot.Logging = require("./utils/Logging")
bot.Channel = require("./utils/Channel")
bot.Utils = {
        misc: require("./utils/Misc"),
        APITwitch: require("./utils/APITwitch"),
        ApiClient: require("./utils/APIClients"),
        command: require("./modules/Command"),
        Celebration: require("./utils/Celebration"),
        Logging: require("./utils/Logging"),
        Temp: {cmdCount: 0, lastCmdUseTime: 0}
    }
bot.Twitch = require("./clients/Twitch")
bot.PubSub = require("./clients/PubSub")
bot.SevenTv = require("./clients/SevenTV")


async function initializeBot() {
    try {
        await bot.DB.start()
        await bot.Twitch.initialize()
        await bot.Logging.Logger()
        await bot.SevenTv.initialize()
        await bot.Utils.Celebration.getListCelebration()
        bot.PubSub
    } catch (e) {
        bot.Logger.error(`Error encountered during initialization: ${e}`)
        throw e; 
    }
}

process
.on('unhandledRejection', async (reason, promise) => {
    bot.Utils.misc.logError("UnhandledRejection", utils.inspect(promise), utils.inspect(reason))
    return bot.Logger.error(`${pc.red('[UnhandledRejection]')} || ${reason}`);
})
.on('uncaughtException', async (err) => {
    bot.Utils.misc.logError("UnhandledRejection", err.message, err.stack || "")
    bot.Logger.error(`${pc.red('[UncaughtException]')} || ${err.message}`);
    return process.exit(0);
});

async function main() {
    try {
        await initializeBot()
        bot.Logger.info(`${pc.green('[Main]')} || Bot started successfully!`)
    } catch (e) {
        bot.Logger.error(`${pc.red('[Main]')} || Error starting bot: ${e}`)
        process.exit(0)
    }
}
main()