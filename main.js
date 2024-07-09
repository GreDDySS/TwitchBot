global.bot = {}


bot.Config = require("./utils/Config")
bot.Twitch = require("./clients/Twitch")
bot.Logger = require("./utils/Winston")
bot.DB = {db} = require("./modules/Database")
bot.Channel = require("./utils/Channel")
bot.Utils = {
    misc: require("./utils/Misc"),
    APITwitch: require("./utils/APITwitch"),
    ApiClient: require("./utils/APIClients"),
    // stats: require("./utils/StatsUpdate"),
    Celebration: require("./utils/Celebration"),
    temp: {cmdCount: 0},
}

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