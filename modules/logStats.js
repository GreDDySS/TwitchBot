function logMessage(){
    setTimeout(() => {
        const timeSinceLastMessage = Date.now() - greddBot.Stats.message.lastMessageTime

        if (timeSinceLastMessage >= 10000){
            if (greddBot.Stats.message.messageCount == 0) return
            greddBot.Utils.stats.messageWrite(greddBot.Stats.message.messageCount)
            greddBot.Stats.message.messageCount = 0
            greddBot.Stats.message.lastMessageTime = Date.now()
        }
        logMessage()
    }, 10000);
}

function logCmds(){
    setTimeout(() => {
        const timeSinceLastCmdUse = Date.now() - greddBot.Stats.command.lastCmdUseTime

        if (timeSinceLastCmdUse >= 15000){
            if (greddBot.Stats.command.cmdCount == 0) return
            greddBot.Utils.stats.cmdUsed(greddBot.Stats.command.cmdCount)
            greddBot.Stats.command.cmdCount = 0
            greddBot.Stats.command.lastCmdUseTime = Date.now()
        }
        logCmds()
    }, 15000)
}

module.exports = {logMessage, logCmds}