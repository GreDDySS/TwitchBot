const pc = require("picocolors")
exports.run = async (client, chat, channel, commandData) => {
    const msgArgs = commandData.message.args
    const isMod = commandData.user.badges.hasModerator
    const isBroad = commandData.user.badges.hasBroadcaster
    try {
        if (msgArgs && (isMod || isBroad) && bot.Config.owner ) {

            await bot.Utils.ApiClient.helix(`channels?broadcaster_id=176257472`, {
                method: "PATCH",
                data: {
                    title: msgArgs
                },
            }).then(() => {
                chat.send(channel, `@${commandData.user.name}, Название успешно обновлено!`)
            }).catch((error) => {
                console.log(error)
            })
            
        } else {
            await bot.Utils.ApiClient.helix(`channels?broadcaster_id=176257472`)
            .then(async (response) => {
                const title = response.data[0].title
                chat.send(channel, `Название стрима: "${title}"`)
            })
        }

    } catch (error) {
        console.log(error)
        bot.Logger.error(`${pc.red(`[ERROR]`)} || Error: ${error}`)
    }
}
module.exports.config = {
    name: "title",
    description: "set tittle stream",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}