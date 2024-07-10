exports.run = async (client, chat, channel, commandData) => {
    let username = commandData.user.login;
    let args = commandData.message.args

    if (args[0]) {
        if (args[0].startsWith("@")) {
            username = args[0].substring(1);
        } else {
            username = args[0]
        }
    }

    let Rchannel = channel
    if(args[1]) {
        if(args[1].startsWith("#")) {
            Rchannel = args[1].substring(1)
        } else {
            Rchannel = args[1]
        }
    }

    const follow = await bot.Utils.APITwitch.getSubage(username, Rchannel)

    if (follow["followedAt"]) {
        const ms = new Date().getTime() - Date.parse(follow["followedAt"])
        chat.send(channel, `@${commandData.user.name}, Пользователь ${username} подписан на ${Rchannel} ${bot.Utils.misc.humanizeDuration(ms)}.`)
    } else {
        client.say(channel, `@${commandData.user.name}, Пользователь ${username} не подписан на ${Rchannel}.`)
    }
}
module.exports.config = {
    name: "followage",
    description: "Give you the time a given user has followed a given channel",
    cooldown: 5000,
    aliases: ["followe"],
    active: true,
    adminOnly: false
}