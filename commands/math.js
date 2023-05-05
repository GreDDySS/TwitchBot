const math = require("mathjs")
exports.run = async (client, chat, channel, commandData) => {
    const args = commandData.message.args
    if (args.length == 0) return

    chat.send(channel, `${math.evaluate(args.join(' '))}`)
        
    
}
module.exports.config = {
    name: "math",
    description: "Mathematical calculator",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: false
}