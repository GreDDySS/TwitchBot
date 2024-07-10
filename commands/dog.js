exports.run = async (client, chat, channel, commandData) => {
    const image = await bot.Utils.ApiClient.request("dog.ceo/api/breeds/image/random")

    chat.send(channel, `@${commandData.user.name}, PogBones ${image.message}`)
}
module.exports.config = {
    name: "dog",
    description: "Random picture dog",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}