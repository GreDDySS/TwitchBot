exports.run = async (client, chat, channel, commandData) => {
    let dateNow = Date.now()
    await client.ping();
    let dateAfterPing = Date.now()
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    const memory = Math.round(used * 100) / 100
    const channelCount = await bot.Channel.getJoinable()
    
    chat.send(channel, `@${commandData.user.name} PONG! 🟢 Ping: ${dateAfterPing - dateNow}ms | Channels: ${channelCount.length} | Uptime: ${bot.Utils.misc.uptime()} | Memory: ${memory}MB/512MBs`)
}
module.exports.config = {
    name: "ping",
    description: "Check status bot",
    cooldown: 5000,
    aliases: ["ping"],
    active: true,
    adminOnly: false
}