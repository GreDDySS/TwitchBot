exports.run = async (client, chat, channel, commandData) => {
    chat.send(channel, `@${commandData.user.name}, Результат: ${greddBot.Utils.misc.random(100)}%`)
}
module.exports.config = {
    name: "%",
    description: "Random precentage between 0% and 100%",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOmnly: false
}