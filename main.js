const utils = require("util")
const pc = require("picocolors");
const fs = require("fs");

global.bot = {}


bot.Config = require("./utils/Config")
bot.DB = {db} = require("./modules/Database")
bot.Logger = require("./utils/Winston")
bot.Channel = require("./utils/Channel")
bot.Utils = {
        misc: require("./utils/Misc"),
        APITwitch: require("./utils/APITwitch"),
        ApiClient: require("./utils/APIClients"),
        command: require("./modules/Command"),
        Celebration: require("./utils/Celebration"),
        Logging: require("./utils/Logging"),
        temp: {cmdCount: 0},
    }
bot.Twitch = require("./clients/Twitch")

async function start() {
    try {
        await bot.DB.start();
        await bot.Twitch.initialize()
        await bot.Utils.Celebration.getListCelebration()
    } catch (e) {
        bot.Logger.error(`Error encountered during initialization: ${e}`)
    }
}
start()

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