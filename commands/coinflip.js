exports.run = async (client, chat, channel, commandData) => {
    let response = ["Орёл", "Решка"]
    let random = Math.floor(Math.random() * response.length) + 0
    client.say(channel, `@${commandData.user.name}, Выпал: ${response[random]}`)
}
module.exports.config = {
    name: "coinflip",
    description: "This command will do a 50/50 coinflip",
    cooldown: 5000,
    aliases: ["cf"],
    active: true,
    adminOmnly: false
}