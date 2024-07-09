const rp = require("request-promise")
const cheerio = require("cheerio")
const pc = require("picocolors")
const urlMy = "https://my-calend.ru/holidays"
const fs = require("fs")
async function getListCelebration() {
    const celebration = []
    await rp(urlMy).then(htm => {
        const $ = cheerio.load(htm)
        const regex = /^\d*\n*|\n*\d*$/gm;
        for (let i = 0; i < 1; i++) {
         $(`article > section:nth-child(5) > ul > li`).each((i, elem) => {
            celebration.push(`${$(elem).text().replace(regex, "").trim()}`)
         })
        }
    })
    fs.writeFileSync("./other/celebration.json", JSON.stringify(celebration, null, 2), {encoding: "utf-8"})
}

function getCelebration() {
    setTimeout(() => {
        getListCelebration().then(() => bot.Logger.info(`${pc.green('[CELEBRATION]')} || Celebration update!`))
    }, 7200 * 1000) // every 2 hours
}
module.exports = {getCelebration, getListCelebration}