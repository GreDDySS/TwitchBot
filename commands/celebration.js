const fs = require("fs")
const user = `Artemu5 BJlaguK_ Bustegg Eggrereal Fedotir GreDDySS GuyRalt Gvardovskiy Gwinsen Iamplugg Iamplugs Matria9 RandomCancer RandomCancer2 StreamElements SunsetColours_ Tuwka_ Xomachel ZULULpa aetenae borobushE crestavlennn eggUrt iLotterytea BetterCallTelevizor m4x0nn monkeoS oladushegg_ rilaveon saopin vexenigmus SunsetColours_ lydeco_ HumanStudi0 AlexanderLer Nipropieren drt_s_s`
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