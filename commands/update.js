const fs = require("fs")
exports.run = async (client, chat, channel, commandData) => {
    bot.Utils.Celebration.getListCelebration().then(async () => {
        const data = JSON.parse(fs.readFileSync("other/celebration.json", {encoding: "utf-8"}))
        await chat.send(channel, `Обновление праздников завершено!`)   
        chat.send(channel, `Загрузил ${data.length} праздник!`)})    
}
module.exports.config = {
    name: "update",
    description: "Update celebration",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: true
}