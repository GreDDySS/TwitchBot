const pc = require("picocolors");
const fs = require("fs");
const utils = require("util")


global.greddBot = {}

greddBot.Config = require("./utils/Config")
greddBot.Logger = require("./utils/Winstone")
greddBot.DB = {db} = require('./utils/Database')
greddBot.Utils = {
    misc: require("./utils/Misc"),
    APITwitch: require("./utils/APITwitch"),
    ApiClient: require("./utils/APIClients"),
    command: require("./modules/command"),
    stats: require("./utils/StatsUpdate"),
    celebration: require("./utils/Celebration"),
    temp: {cmdCount: 0},
}
greddBot.Stats = {
    log: require("./modules/logStats"),
    message: {
        messageCount: 0,
        lastMessageTime: Date.now()
    },
    command: {
        cmdCount: 0,
        lastCmdUseTime: Date.now()
    }
}
greddBot.Channel = require("./modules/channel")
greddBot.Twitch = {initialize} = require("./clients/twitch")
greddBot.Telegram = require("./clients/telegram")
greddBot.Seven = require("./clients/sevenTV")
greddBot.Pubsub = require("./clients/pubsub")
greddBot.Web = require("./web/server")

// Initializing
async function start() {
    try {
        greddBot.Logger
        greddBot.Web.keepAlive()
        await greddBot.DB.start()
        await greddBot.Twitch.initialize()
        await greddBot.Seven.initialize()
        greddBot.Telegram
        greddBot.Pubsub
    } catch (e) {
        greddBot.Logger.error(`Error encountered during initialization: ${e}`);
    }
};
start();

process
.on('unhandledRejection', async (reason, promise) => {
    greddBot.Utils.misc.logError("UnhandledRejection", utils.inspect(promise), utils.inspect(reason))
    return greddBot.Logger.error(`${pc.red('[UnhandledRejection]')} || ${reason}`);
})
.on('uncaughtException', async (err) => {
    greddBot.Utils.misc.logError("UnhandledRejection", err.message, err.stack || "")
    greddBot.Logger.error(`${pc.red('[UncaughtException]')} || ${err.message}`);
    return process.exit(0);
});