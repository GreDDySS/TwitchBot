exports.run = async (client, chat, channel, commandData) => {
    const stats = await bot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
    const msg = stats.rows.map((item) => {return item.messageLine})
    const cmd = stats.rows.map((item) => {return item.cmdUsed})    
    chat.send(channel, `@${commandData.user.name}, total stats: Messages: ${msg}, CmdUse: ${cmd}`)
}
module.exports.config = {
    name: "stats",
    description: "Check stats bot",
    cooldown: 5000,
    aliases: ["stats"],
    active: true,
    adminOnly: false
}