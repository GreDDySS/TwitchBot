const pc = require("picocolors")
const { SayError } = require("@kararty/dank-twitch-irc")


const send = async (channel, message) => {
    try {
        let lengthLimit = 400
        lengthLimit -= 2
        let truncatedMessage = message.substring(0, lengthLimit)
        if (truncatedMessage.length < message.length) {
            truncatedMessage = `${message.substring(0, --lengthLimit)}...`
        }

        await bot.Twitch.client.say(channel, truncatedMessage)
    } catch (error) {

        if (error instanceof SayError && error.message.includes("@msg-id=msg_rejected")
          ) {
            await bot.Twitch.client.say(channel, "That message violates the channel automod settings.");
          }
          if (error instanceof SayError && error.message.includes("@msg-id=msg_duplicate")) {
            await bot.Twitch.client.say(channel, "That message was a duplicate FeelsDankMan");
          }
          await bot.Twitch.client.say(channel, "Error while processing the reply message monkaS");
          bot.Logger.error(`${pc.red("[MESSAGE ERROR]")} || Error while processing the reply message: ${error.message} `);
          bot.Utils.misc.logError("SendError", error.message, error.stack);
        }
}

const sendError = (channel, message) => {
    bot.Twitch.client.sendRaw(`PRIVMSG #${channel} :${message}`)
}

const sendCommand = async (channel, message) => {
    await bot.Twitch.client.privmsg(channel, message)
}

module.exports = {send, sendError, sendCommand}