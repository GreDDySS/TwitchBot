exports.run = async (client, chat, channel, commandData) => {
    chat.send(channel, `@${commandData.user.name}, Результат: ${greddBot.Utils.misc.random(6)}`);
}
module.exports.config = {
    name: "dice",
    description: "Random number from 1 to 6",
    cooldown: 5000,
    aliases: ["кубик"],
    active: true,
    adminOmnly: false
}