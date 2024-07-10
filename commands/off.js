exports.run = async (client, chat, channel, commandData) => {
    await chat.send(channel, "ppPoof off!")
    process.exit()
}
module.exports.config = {
    name: "off",
    description: "Off bot",
    cooldown: 5000,
    aliases: ["shutdown"],
    active: true,
    adminOnly: true
}