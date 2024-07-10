exports.run = async (client, chat, channel, commandData) => {
    const fox = await bot.Utils.ApiClient.request("randomfox.ca/floof/")

    chat.send(channel, `@${commandData.user.name}, 🦊 ${fox.image}`)
}
module.exports.config = {
    name: "fox",
    description: "random image fox",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}