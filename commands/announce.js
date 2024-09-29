exports.run = async (client, chat, channel, commandData) => {
  const arg = commandData.message.args
    if (commandData.user.badges.hasBroadcaster) {
      if(commandData.message.args[0] === "-up") {
        return client.say(channel, `${arg}`)
      }
    }

  chat.send(channel, `@${commandData.user.name}, CoolCat ${image[0].url}`)
}
module.exports.config = {
  name: "announce",
  description: "Set announce event in chat strem",
  cooldown: 5000,
  aliases: ["анонс", "stream"],
  active: true,
  adminOnly: false
}