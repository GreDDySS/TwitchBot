const pc = require("picocolors")
async function Logger() {
    const channels = await bot.Channel.getChannelLogging()
    const buffers = {}
    channels.forEach(channel => {
        buffers[channel] = []
    })
    
    bot.Twitch.client.on("PRIVMSG", (msg) => {
        const bots = [bot.Config.username, "teabot", "streamelements", "pwgud", "peepositbot", "supibot", "ppspin", "nightbot"]
        if(bots.includes(msg.senderUsername.toLowerCase())) {
            return
        }
        
        const channelID = msg.channelID
        if (!buffers[channelID]) {
            buffers[channelID] = []
        }
        
        buffers[channelID].push({
            username: msg.senderUsername,
            color: msg.colorRaw,
            message: msg.messageText,
            date: Date.now()
        })
    })
    const INTERVAL = 60 * 1000 // Seconds
    setInterval(async () => {
        for (const channelID in buffers) {
            if (buffers[channelID].length > 0) {
                await pushToDataabse(channelID, buffers[channelID])
                buffers[channelID] = []
            }
        }
    }, INTERVAL);
    
}

async function pushToDataabse(channelID, messages) {
    const values = messages.map(msg => `('${msg.username}', '${msg.color}', '${msg.message}', to_timestamp(${msg.date} / 1000.0))`)
    const query = `INSERT INTO "channelLogs"."${channelID}" (username, color, message, date) VALUES ${values}`

    try {
        await bot.DB.db.query(query)
    } catch (error) {
        bot.Logger.error(`${pc.red("[LOGGING]")} || Error sending values in DB: ${error}`)
    }
    
}

Logger()