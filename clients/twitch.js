const {AlternateMessageModifier, SlowModeRateLimiter, ChatClient, LoginError, JoinError, SayError, PrivmsgMessage} = require("@kararty/dank-twitch-irc")
const pc = require("picocolors")
const fs = require("fs")


const client = new ChatClient({
    username: greddBot.Config.username,
    password: greddBot.Config.password,
    rateLimits: "default",
})

client.use(new AlternateMessageModifier(client))
client.use(new SlowModeRateLimiter(client, 10))

client.commands = new Map()
client.aliases = new Map()
client.cooldown = new Map()

fs.readdir(__dirname + "/../commands", (err, files) => {
    if (err) return greddBot.Logger.error(`${pc.red("[ERROR]")} || Error load commands ${err}`);

    const jsfile = files.filter((f) => f.split(".").pop() == "js")
    if (!jsfile) {
        greddBot.Logger.warn(`${pc.magenta("[WARN]")} || No command found! `);
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

async function initialize()  {
    const channels = await greddBot.Channel.getJoinable()
    await client.joinAll(channels)
    await client.connect()
}



client.on("error", (error) => {
    if (error instanceof LoginError) {
        return greddBot.Logger.error(`${pc.red("[T-LOGIN]")} || Error logging in to twitch: ${error}`)
    }
    if (error instanceof JoinError) {
        return // greddBot.Logger.error(`${pc.red("[T-JOIN]")} || Error joing channel ${error.failedChannelName} : ${error}`)
    }
    if (error instanceof SayError) {
        return greddBot.Logger.error(`${pc.red("[T-SAT]")} || Error sending message in: ${error.failedChannelName} : ${error.cause} | ${error.message}`)
    }
    greddBot.Logger.error(`${pc.red("[T-ERROR]")} || Error occured in DTI: ${error}`)
})

client.on("ready", async ()=> {
    greddBot.Logger.info(`${pc.green("[TWITCH]")} || Connected to Twitch 🟢`)
    await client.say("greddyss", `${greddBot.Utils.misc.randomConnectEmote()}`)
})

client.on("CLEARCHAT", async (msg) => {
    if (msg.isTimeout()) {
        greddBot.Logger.warn(`${pc.yellow("[TIMEOUT]")} || ${msg.targetUsername} got time out in ${msg.channelName} for ${msg.banDuration}s`)
    }
    if (msg.isPermaban && !msg.banDuration) {
        greddBot.Logger.warn(`${pc.yellow("[BAN]")} || ${msg.targetUsername} got banned in ${msg.channelName}`)
        if (msg.targetUsername === greddBot.Config.username) {
            await greddBot.DB.db.query(`Update channel Set "ignore" = '1' Where "name" = '${msg.channelName}'`)
        }
    }
    if (msg.wasChatCleared()) {
        greddBot.Logger.warn(`${pc.yellow("[CLEARCHAT]")} || Chat was cleared in ${msg.channelName}`)
    }
})


client.on("PRIVMSG", (msg) => handleUserMessage(msg))

const handleUserMessage = async (msg) => {
    const type = "privmsg"
    const message = msg.messageText
    const content = message.split(/\s+/g)
    const command = content[0]
    const commandString = command.slice(greddBot.Config.prefix.length)
    const channelMeta = await greddBot.Channel.getById(msg.channelID)
    const args = content.slice(1)

    const commandData = {
        user: {
          id: msg.senderUserID,
          name: msg.displayName,
          login: msg.senderUsername,
          color: msg.colorRaw,
          badges: msg.badges,
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
    
    if (msg.senderUsername === greddBot.Config.username && channelMeta) {
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
                await greddBot.DB.db.query(`Update channel Set "mode" = '${mode}' Where "userId" = '${msg.channelID}'`)
            }
        }
    }
    
    // Ignore any message from self
    if(msg.senderUsername == greddBot.Config.username) {
        return
    }

    

    // Logging stats
    greddBot.Stats.log.logCmds()
    greddBot.Stats.log.logMessage()

    // Funny
    if (msg.channelID == "191400264"){
        if(message == "Alright") {
            client.say(commandData.channel, "Alright")
        }
    }
    if (commandData.user.id == "555579413" && message == "monkaGIGAftSaj 🚨 НАЗАР АУДАРЫҢЫЗ!") {
        greddBot.Utils.command.sendCommand("ilotterytea", "/me monkaS 🚨 АЛЁРТ!")
    }

    
    const isIgnore = channelMeta.map((item) => { return item.ignore})
    if( isIgnore === true) {
        return
    }
    const chat = greddBot.Utils.command  
    if (msg.messageText.startsWith(greddBot.Config.prefix)) {
        greddBot.Stats.log.logCmds()
        let cmd = commandString.toLowerCase()
        let channel = commandData.channel
        var cmdF = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd))
        if (!cmdF || cmdF.cooldown_users.includes(commandData.user.id)) return
        
        // check command active
        if (cmdF.config.active == false) {
            return
        }
        
        if (cmdF.config.adminOnly && !(commandData.user.name == greddBot.Config.owner)) return;
        try {
            cmdF.run(client, chat, channel, commandData)
            greddBot.Stats.command.cmdCount++
            greddBot.Stats.command.lastCmdUseTime = Date.now()
            greddBot.Utils.temp.cmdCount++
            setUserCooldown(cmdF, commandData)
        } catch (err) {
            greddBot.Utils.misc.logError("Commands", err.message, err.stack || "")
            greddBot.Logger.error(`${pc.red("[ERROR]")} || Error occurred when running the command ` + `${err}`)
        }
    }
    
    if (msg.messageText) {
        if(msg.messageText.startsWith(greddBot.Config.prefix)) return
        greddBot.Stats.message.messageCount++
        greddBot.Stats.message.lastMessageTime = Date.now()
    }
    
    module.exports = {commandData, cmdF}
}
module.exports = {client, initialize}