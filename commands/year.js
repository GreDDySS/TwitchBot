exports.run = async (client, chat, channel, commandData) => {
    let today = new Date()
    newYearDate = new Date(today.getFullYear() + 1, 0,1)
    let result = newYearDate - today
    days = Math.floor(result / (24 * 60 * 60 * 1000))
    hours = Math.floor((result / (60 * 60 * 1000) - 3) % 24)
    mins = Math.floor((result / 1000 / 60 ) % 60)
    chat.send(channel, `До конца года осталось: ${days}д ${hours}ч ${mins}м`)
}
module.exports.config = {
    name: "year",
    description: "To find out how many days are left until the end of the year",
    cooldown: 5000,
    aliases: ["нг", "год"],
    active: true,
    adminOnly: false
}