const rp = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
exports.run = async (client, chat, channel, commandData) => {
    const ID = []
    const url = `https://fem.ilotterytea.kz/user/${commandData.user.login}`
    try {
        await rp(url).then(htm => {
            const $ = cheerio.load(htm)
            $(`#id`).each((i, elem) => {
                ID.push($(elem).text().replace(/[^0-9]/g,""))
            })
            chat.send(channel, `@${commandData.user.name}, NFM: ${ID}`)
        })
    } catch (err) {
        chat.send(channel, `@${commandData.user.name}, Такого пользователя нет`)
    }

}
module.exports.config = {
    name: "check",
    description: "Check id nfm",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOmnly: false
}