const fs = require("fs")
const user = `Artemu5 BJlaguK_ Eggrereal Fedotir GreDDySS GuyRalt Gvardovskiy Iamplugg Matria9 RandomCancer StreamElements SunsetColours_ Tuwka_ Xomachel ZULULpa borobushE crestavlennn eggUrt iLotterytea  m4x0nn monkeoS rilaveon saopin lydeco_ HumanStudi0 Nipropieren avacuoss TheRennaisance neizyum `
exports.run = async (client, chat, channel, commandData) => {
    const data = JSON.parse(fs.readFileSync("other/celebration.json", {encoding: "utf-8"}))
    const num = bot.Utils.misc.random(data.length)
    if(commandData.message.args[0] === "тык" && channel === "iamplugg") {
        return client.say(channel, `${user} Сегодняшний праздник: ${data[num - 1]}`)
    }
    if(commandData.message.args[0] === "info") {
        return chat.send(channel, `Сегодняшний праздник: ${data[num - 1]} — ${num} из ${data.length}`)
    } else {
        return chat.send(channel, `Сегодняшний праздник: ${data[num - 1]}`)
    }

}
module.exports.config = {
    name: "celebration",
    description: "What a holiday today",
    cooldown: 5000,
    aliases: ["праздник", "prazdnik"],
    active: true,
    adminOnly: false
}