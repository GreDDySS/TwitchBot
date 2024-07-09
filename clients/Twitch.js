const {AlternateMessageModifier, SlowModeRateLimiter, ChatClient, LoginError, JoinError, SayError, PrivmsgMessage} = require("@kararty/dank-twitch-irc")
const pc = require("picocolors")
const fs = require("fs")

const client = new ChatClient({
    username: bot.Config.username,
    password: bot.Config.password,
    rateLimits: "default"
})

client.use(new AlternateMessageModifier(client))
client.use(new SlowModeRateLimiter(client, 10))

client.commands = new Map()
client.aliases = new Map()
client.cooldown = new Map()

fs.readdir(__dirname + "/../commands", (err, files) => {
    if (err) return bot.Logger.error(`${pc.red("[ERROR]")} || Error load commands ${err}`);

    const jsfile = files.filter((f) => f.split(".").pop() == "js")
    if (!jsfile) {
        bot.Logger.warn(`${pc.magenta("[WARN]")} || No command found! `);
        return
    }

    jsfile.forEach((f, i) => {
        let pull = require(`../commands/${f}`)
        pull["cooldown_users"] = []
        client.commands.set(pull.config.name, pull)
        client.cooldown.set(0, pull.config.cooldown)
        pull.config.aliases.forEach((alias) => {
            client.aliases.set(alias, pull.config.name)
        })
    })
})

// setUSerCooldown

async function initialize() {
    const channels = bot.Channel.getJoinable()
    await client.joinAll(channels)
    await client.connect()
}


client.on("ready", async ()=> {
    bot.Logger.info(`${pc.green("[TWITCH]")} || Connected to Twitch 🟢`)
    await client.say("greddyss", `${bot.Utils.misc.randomConnectEmote()}`)
})

client.on("error", (error) => {
    if (error instanceof LoginError) {
        return bot.Logger.error(`${pc.red("[T-LOGIN]")} || Error logging in to twitch: ${error}`)
    }
    if (error instanceof JoinError) {
        return // bot.Logger.error(`${pc.red("[T-JOIN]")} || Error joing channel ${error.failedChannelName} : ${error}`)
    }
    if (error instanceof SayError) {
        return bot.Logger.error(`${pc.red("[T-SAT]")} || Error sending message in: ${error.failedChannelName} : ${error.cause} | ${error.message}`)
    }
    bot.Logger.error(`${pc.red("[T-ERROR]")} || Error occured in DTI: ${error}`)
})

client.on("CLEARCHAT", async (msg) => {
    if (msg.isTimeout()) {
        bot.Logger.warn(`${pc.yellow("[TIMEOUT]")} || ${msg.targetUsername} got time out in ${msg.channelName} for ${msg.banDuration}s`)
    }
    if (msg.isPermaban && !msg.banDuration) {
        bot.Logger.warn(`${pc.yellow("[BAN]")} || ${msg.targetUsername} got banned in ${msg.channelName}`)
        if (msg.targetUsername === greddBot.Config.username) {
            await greddBot.DB.db.query(`Update channel Set "ignore" = '1' Where "name" = '${msg.channelName}'`)
        }
    }
    if (msg.wasChatCleared()) {
        bot.Logger.warn(`${pc.yellow("[CLEARCHAT]")} || Chat was cleared in ${msg.channelName}`)
    }
})


module.exports = {client, initialize}