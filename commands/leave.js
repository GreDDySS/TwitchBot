exports.run = async (client, chat, channel, commandData) => {
    const arg = commandData.message.args
    if (commandData.user.badges.hasBroadcaster) {
        if (arg.length > 0) return
        await bot.DB.db.query(`Delete from channel where "userId" = '${commandData.user.id}'`)
        client.part(commandData.user.login)
    }

    if (commandData.user.login == bot.Config.owner) {
        const uid = await bot.Utils.APITwitch.getLoginInfo(arg[0])
        const result = uid.map((item) => {return item.id})
        await bot.DB.db.query(`Delete from channel where "userId" = '${result}'`)
    } else {
        chat.send(channel, `@${commandData.user.name}, У вас нет прав.`)
    }
}
module.exports.config = {
    name: "leave",
    description: "Leave channel",
    cooldown: 666,
    aliases: [],
    active: true,
    adminOnly: false
}