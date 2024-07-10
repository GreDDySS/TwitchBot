exports.run = async (client, chat, channel, commandData) => {
    let uid = commandData.user.id;
    let args = commandData.message.args

    if (args[0]) {
        if (args[0].startsWith("@")) {
            args[0] = args[0].substring(1);
        } 
        let username = args[0]

        uid = await bot.Utils.APITwitch.getLoginInfo(username)
        uid = uid.map((item) => {return item.createdAt})
    } else {
        uid = await bot.Utils.APITwitch.getIdInfo(uid)
        uid = uid.map((item) => {return item.createdAt})
    }
    
    const ms = new Date().getTime() - Date.parse(uid)

    if (args[0]) {
        if (args[0].startsWith("@")) {
            args[0] = args[0].substring(1);
        }
        chat.send(channel, `@${commandData.user.name}, аккаунт ${args[0]} был создан ${bot.Utils.misc.humanizeDuration(ms)} назад`)
    } else {
        chat.send(channel, `@${commandData.user.name}, аккаунт был создан ${bot.Utils.misc.humanizeDuration(ms)} назад.`)
    }
}
module.exports.config = {
    name: "accage",
    description: "This command will tell you the specified users account age.",
    cooldown: 10000,
    aliases: ["accountage", "age"],
    active: true,
    adminOnly: false
}