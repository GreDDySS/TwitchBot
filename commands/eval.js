exports.run = async (client, chat, channel, commandData) => {
    const ev = await eval('(async () => {' + commandData.message.args.join(' ') + '})()')

    if (ev) return chat.send(channel, `${String(ev)}`)
}
module.exports.config = {
    name: "eval",
    description: "js code",
    cooldown: 5000,
    aliases: [],
    active: false,
    adminOnly: true
}