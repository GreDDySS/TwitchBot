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

function setUserCooldown(cmdF, commandData) {
    // add user in cooldown
    cmdF.cooldown_users.push(commandData.user.id)

    let cooldown = client.cooldown.get(0)

    setTimeout(() => {
        cmdF.cooldown_users = cmdF.cooldown_users.filter((i) => {
            i !== commandData.user.id
        })
    }, cooldown);
} 

async function initialize() {
    const channels = await bot.Channel.getJoinable()
    await client.joinAll(channels)
    await client.connect()
}

client.on("error", (error) => {
    const errorHandlers = {
        LoginError: () => bot.Logger.error(`${pc.red("[T-LOGIN]")} || Error logging in to twitch: ${error}`),
        JoinError: () => bot.Logger.error(`${pc.red("[T-JOIN]")} || Error joining channel ${error.failedChannelName} : ${error}`),
        SayError: () => bot.Logger.error(`${pc.red("[T-SAT]")} || Error sending message in: ${error.failedChannelName} : ${error.cause} | ${error.message}`),
    }

    const errorType  = error.constructor.name
    const errorMessage = errorHandlers[errorType]?.() || `${pc.red("[T-ERROR]")} || Произошла ошибка в DTI: ${error}`

    if (errorMessage) {
        bot.Logger.error(errorMessage);
    }
})

client.on("ready", async ()=> {
    bot.Logger.info(`${pc.green("[TWITCH]")} || Connected to Twitch 🟢`)
    await client.say("greddyss", `${bot.Utils.misc.randomConnectEmote()}`)
})

client.on("CLEARCHAT", async (msg) => {
    if (msg.isTimeout()) {
        bot.Logger.warn(`${pc.yellow("[TIMEOUT]")} || ${msg.targetUsername} got time out in ${msg.channelName} for ${msg.banDuration}s`)
    }
    if (msg.isPermaban && !msg.banDuration) {
        bot.Logger.warn(`${pc.yellow("[BAN]")} || ${msg.targetUsername} got banned in ${msg.channelName}`)
        if (msg.targetUsername === bot.Config.username) {
            await bot.DB.db.query(`Update channel Set "ignore" = '1' Where "name" = '${msg.channelName}'`)
        }
    }
    if (msg.wasChatCleared()) {
        bot.Logger.warn(`${pc.yellow("[CLEARCHAT]")} || Chat was cleared in ${msg.channelName}`)
    }
})

client.on("PRIVMSG", (msg) => handleUserMessage(msg))

const handleUserMessage = async (msg) => {
    const type = "privmsg"
    const message = msg.messageText
    const content = message.split(/\s+/g)
    const command = content[0]
    const commandString = command.slice(bot.Config.prefix.length)
    const channelMeta = await bot.Channel.getById(msg.channelID)
    const args = content.slice(1)

    const commandData = {
        user: {
          id: msg.senderUserID,
          name: msg.displayName,
          login: msg.senderUsername,
          color: msg.colorRaw,
          badges: msg.badgesRaw,
        },
        message: {
          raw: msg.rawSource,
          text: message,
          args: args,
        },
        type: type,
        command: commandString,
        channel: msg.channelName,
        channelId: msg.channelID,
        channelMeta: channelMeta,
        userState: msg.ircTags,
    };
    
    // Ignore any message from self
    if(msg.senderUsername == bot.Config.username) {
        return
    }

    if (msg.senderUsername === bot.Config.username && channelMeta) {
        const currentMode = channelMeta.map((item) => { return item.mode})
        if (msg.badges) {
            if (msg.badges.hasModerator || msg.badges.hasBroadcaster) {
                mode = "Moderator"
            } else if (msg.badges.hasVIP) {
                mode = "VIP"
            } else {
                mode = "Chatter"
            }
            if (currentMode !== mode) {
                await bot.DB.db.query(`Update channel Set "mode" = '${mode}' Where "userId" = '${msg.channelID}'`)
            }
        }
    }

    // Funny
    if (msg.channelID == "191400264"){
        if(message == "Alright") {
            client.say(commandData.channel, "Alright")
        }
        if (message == "monkeos"){
            if(commandData.user.id == "555579413" || commandData.user.id == "725333641" || commandData.user.id == "812296822") return
            client.say(commandData.channel, "monkeos")
        }
    }

    if (commandData.user.id == "555579413" && message == "monkaGIGAftSaj 🚨 НАЗАР АУДАРЫҢЫЗ!") {
        bot.Utils.command.sendCommand("ilotterytea", "/me monkaS 🚨 АЛЁРТ!")
    }

    const isIgnore = channelMeta.map((item) => { return item.ignore})
    if( isIgnore === true) {
        return
    }

    const chat = bot.Utils.command  
    if (msg.messageText.startsWith(bot.Config.prefix)) {
        bot.Logging.LoggerCMD()
        let cmd = commandString.toLowerCase()
        let channel = commandData.channel
        var cmdF = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd))
        if (!cmdF || cmdF.cooldown_users.includes(commandData.user.id)) return
        
        // check command active
        if (cmdF.config.active == false) {
            return
        }
        
        if (cmdF.config.adminOnly && !(commandData.user.name == bot.Config.owner)) return;
        try {
            cmdF.run(client, chat, channel, commandData)
            bot.Utils.Temp.cmdCount++
            bot.Utils.Temp.lastCmdUseTime = Date.now()
            setUserCooldown(cmdF, commandData)
        } catch (err) {
            bot.Utils.misc.logError("Commands", err.message, err.stack || "")
            bot.Logger.error(`${pc.red("[ERROR]")} || Error occurred when running the command ` + `${err}`)
        }
    }

    module.exports = {commandData, cmdF}
}


module.exports = {client, initialize}