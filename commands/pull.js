const shell = require("child_process")
exports.run = async (client, chat, channel, commandData) => {
    await chat.send(channel, `🔄️ Pull files...`)
    shell.exec("git pull")
    shell.exec("npm i")
}
module.exports.config = {
    name: "pull",
    description: "Pull the files from github",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOnly: true
}