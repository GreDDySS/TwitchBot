exports.run = async (client, channel,commandData) => {
    client.say(channel, `test ${greddBot.Utils.temp.cmdCount}`)
}
module.exports.config = {
    name: "test",
    description: "test",
    cooldown: 1,
    aliases: ["test"],
    adminOnly: false,
}