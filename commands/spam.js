exports.run = async (client, chat, channel, commandData) => {
    const args = commandData.message.args
    var range = parseInt(args[0])

    if (isNaN(range)) return

    if (range > 50) return chat.send(channel, `${commandData.user.name}, [0-50] text`)

    var msg = args.slice(1, args.length).join(' ')
    var regex = /(!|@|#|\$|%|\^|&|\*|\(|\)|-|=|\+|\\|\/|:|"|'|\[|\]|\||<|>|\?|\.)/;
    
    if (regex.test(msg)) {
        chat.send(channel, `NOIDONTTHINKSO`)
        return
    }

    for (let i = 0; i < range; i++) {
        chat.send(channel, msg)
    }
}
module.exports.config = {
    name: "spam",
    description: "Repeat message",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: true
}