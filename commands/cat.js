exports.run = async (client, chat, channel, commandData) => {
    const image = await bot.Utils.ApiClient.request("api.thecatapi.com/v1/images/search")

    chat.send(channel, `@${commandData.user.name}, CoolCat ${image[0].url}`)
}
module.exports.config = {
    name: "cat",
    description: "Give you a link to a picture of a random cat",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}