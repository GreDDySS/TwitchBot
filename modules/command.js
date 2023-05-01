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

        await greddBot.Twitch.client.say(channel, truncatedMessage)
    } catch (error) {

        if (error instanceof SayError && error.message.includes("@msg-id=msg_rejected")
          ) {
            await greddBot.Twitch.client.say(channel, "That message violates the channel automod settings.");
          }
          if (error instanceof SayError && error.message.includes("@msg-id=msg_duplicate")) {
            await greddBot.Twitch.client.say(channel, "That message was a duplicate FeelsDankMan");
          }
          await greddBot.Twitch.client.say(channel, "Error while processing the reply message monkaS");
          greddBot.Logger.error(`${pc.red("[MESSAGE ERROR]")} || Error while processing the reply message: ${error.message} `);
          greddBot.Utils.misc.logError("SendError", error.message, error.stack);
        }
}

const sendError = (channel, message) => {
    greddBot.Twitch.client.sendRaw(`PRIVMSG #${channel} :${message}`)
}

const sendCommand = async (channel, message) => {
    await greddBot.Twitch.client.privmsg(channel, message)
}

module.exports = {send, sendError, sendCommand}