exports.run = async (client, chat, channel, commandData) => {
    let username = commandData.user.login;
    let args = commandData.message.args

    if (args[0]) {
        if (args[0].startsWith("@")) {
            args[0] = args[0].substring(1);
        }
        username = args[0]
    }

    let isColor = false
    if(args[0]) {
        if(args[0].startsWith("#")) {
            isColor = true
        }
    }


    let color = ""
    if (isColor === false) {
        let userColor = await bot.Utils.APITwitch.getLoginInfo(username)
        color = userColor.map((item) => {return item.chatColor.replace("#", "")})
    } else {
        color = args[0].substring(1)
    }
    const colorName = await bot.Utils.ApiClient.request(`www.thecolorapi.com/id?hex=${color}`)

    if (isColor === true) {
        client.say(channel, `@${commandData.user.name}, HEX цвет: ${colorName.name.value} ${color}`)
    } else {
        client.say(channel, `@${commandData.user.name}, Этот пользователь использует: ${colorName.name.value} ${color} `)
    }

}

module.exports.config = {
    name: "color",
    description: "Says the name of the user's color",
    cooldown: 5000,
    aliases: ["stats"],
    active: true,
    adminOnly: false
}