exports.run = async (client, chat, channel, commandData) => {
    const args = commandData.message.args
    if (args.length == 0) {
        const channelName = await bot.DB.db.query(`Select * from channel where "userId" = '${commandData.user.id}'`)
        if (channelName.rows.length === 0) {
            await bot.DB.db.query(`Insert into "channel" ("userId", "name") values ($1, $2)`, [commandData.user.id, commandData.user.login])
            await client.join(commandData.user.login)
            chat.send(commandData.user.login, `@${commandData.user.name}, YO!`)
            chat.send(channel, `Успешно подключился к ${commandData.user.name} FeelsOkayMan`)
        } else {
            chat.send(channel, `@${commandData.user.name}, Я уже есть на вашем канале 🤓`)
        }
        
    } else {
        if (commandData.user.login == bot.Config.owner){
            const user = await bot.Utils.APITwitch.getLoginInfo(args[0])
            const uid = user.map((item) => {
                return item.id
            })
            await bot.DB.db.query(`Insert into "channel" ("userId", "name") values ($1, $2)`, [uid, args[0]])
            await chat.send(args[0], `@${args[0]}, YO!`)
            await chat.send(channel, `@${commandData.user.name}, Успешно подключился к ${args[0]} FeelsOkayMan`)
        } else {
            chat.send(channel, `У вас нет прав NOIDONTTHINKSO`)
        }
    }
}
module.exports.config = {
    name: "join",
    description: "Connect to channel user",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}