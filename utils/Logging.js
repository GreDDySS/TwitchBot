const pc = require("picocolors")
var messageCount = 0
var lastMessageTime = 0

async function Logger() {
    const channels = await bot.Channel.getChannelLogging()
    const buffers = {}
    channels.forEach(channel => {
        buffers[channel] = []
    })
    
    bot.Twitch.client.on("PRIVMSG", (msg) => {
        const channelID = msg.channelID
        if (!buffers[channelID]) {
            buffers[channelID] = []
        }
        
        buffers[channelID].push({
            username: msg.displayName,
            badge: msg.badgesRaw,
            color: msg.colorRaw,
            message: msg.messageText,
            date: Date.now()
        })

        if (msg.messageText) {
            if(msg.messageText.startsWith(bot.Config.prefix)) return
            messageCount++
            lastMessageTime = Date.now()
        }
        LoggerMessage()
    })
    const INTERVAL = 60 * 1000 // Seconds
    setInterval(async () => {
        for (const channelID in buffers) {
            if (buffers[channelID].length > 0) {
             await loggingMessage(channelID, buffers[channelID])
                buffers[channelID] = []
            }
        }
    }, INTERVAL);
    
}


async function LoggerMessage() {
    setTimeout(() => {
        const timeSinceLastMessage = Date.now() - lastMessageTime
        
        if (timeSinceLastMessage >= 10000) {
            if(messageCount == 0) return
            messageWrite(messageCount)
            messageCount = 0
            lastMessageTime = Date.now()
        }
        LoggerMessage()
    }, 10000)
}

async function LoggerCMD() {
    setTimeout(() => {
        const timeSinceLastCmdUse = Date.now() -  bot.Utils.Temp.lastCmdUseTime
        
        if (timeSinceLastCmdUse >= 10000) {
            if(bot.Utils.Temp.cmdCount == 0) return
            cmdUsed(bot.Utils.Temp.cmdCount)
            bot.Utils.Temp.cmdCount = 0
            bot.Utils.Temp.lastCmdUseTime = Date.now()
        }
        LoggerCMD()
    }, 10000)
}



async function loggingMessage(channelID, messages) {
    const values = messages.map(msg => `('${msg.username}', '${msg.badge}', '${msg.color}', '${msg.message}', to_timestamp(${msg.date} / 1000.0))`)
    const query = `INSERT INTO "channelLogs"."${channelID}" (username, badge, color, message, date) VALUES ${values}`

    try {
        await bot.DB.db.query(query)
    } catch (error) {
        bot.Logger.error(`${pc.red("[LOGGING]")} || Error sending values in DB: ${error}`)
    }
    
}

const messageWrite = async (messageCount) => {
    const stats = await bot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
    const old_num = stats.rows.map((item) => {
          return item.messageLine
    })
    let result = messageCount + Number(old_num) 

    try {
        await bot.DB.db.query(`Update stats Set "messageLine" = ${result} Where "name" = 'globalStats'`)
    } catch (error) {
        bot.Logger.error(`${pc.red("[LOGGING]")} || Error sending values in DB: ${error}`)
    }
    
}

const cmdUsed = async (cmdCount) => {
    const stats = await bot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
    const old_num = stats.rows.map((item) => {
          return item.cmdUsed
    })
    let result = cmdCount + Number(old_num)

    try {
        await bot.DB.db.query(`Update stats Set "cmdUsed" = ${result} Where "name" = 'globalStats'`)
    } catch (error) {
        bot.Logger.error(`${pc.red("[LOGGING]")} || Error sending values in DB: ${error}`)
    }
    
}

module.exports = {LoggerCMD, Logger}