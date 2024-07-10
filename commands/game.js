const pc = require("picocolors")
exports.run = async (client, chat, channel, commandData) => {
    const msgArgs = commandData.message.args
    const isMod = commandData.user.badges.hasModerator
    const isBroad = commandData.user.badges.hasBroadcaster
    try {
        if (msgArgs && (isMod || isBroad) && bot.Config.owner ) {
            await bot.Utils.ApiClient.helix(`games?name=${msgArgs}`)
            .then(async (response) => {
                if (response.data.length > 0) {
                    const gameId = response.data[0].id;
                    await bot.Utils.ApiClient.helix(`channels?broadcaster_id=176257472`, {
                        method: "PATCH",
                        data: {
                            game_id: gameId
                        },
                    }).then(() => {
                        chat.send(channel, `@${commandData.user.name}, Успешно обновлено!`)
                    }).catch((error) => {
                        console.log(error)
                    })
                } else {
                    chat.send(channel, `@${commandData.user.name}, данной игры не найдено.`)
                }
            })
        } else {
            await bot.Utils.ApiClient.helix(`channels?broadcaster_id=176257472`)
            .then(async (response) => {
                const game = response.data[0].game_name
                chat.send(channel, `GreDDySS сейчас в категории ${game}`)
            })
        }
    } catch (error) {
        console.log(error)
        bot.Logger.error(`${pc.red(`[ERROR]`)} || Error: ${error}`)
    }
}
module.exports.config = {
    name: "game",
    description: "Change channel game",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: true
}