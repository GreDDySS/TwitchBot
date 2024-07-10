exports.run = async (client, chat, channel, commandData) => {
    let arr = ""
    const arg = commandData.message.args.join(" ").replace('!', 'ǃ').replace('=', '꓿').replace('$', '💲').replace("🥛", "⚪") + ' '
    
    while (arr.length + arg.length + 1 < 485) arr += arg.repeat(1) + ' '
    return chat.send(channel, `${arr}`)
}
module.exports.config = {
    name: "fill",
    description: "Repeats the specified phrase until it reaches 500 characters",
    cooldown: 30000,
    aliases: [],
    active: true,
    adminOnly: false
}