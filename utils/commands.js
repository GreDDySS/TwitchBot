const fs = require('fs');

const CMD_DIR = "./commands"
const FILES = fs.readdirSync(CMD_DIR)
const commandsData = []

for (const file of FILES) {
    const cmd = require(`../commands/${file}`)
    const cfg = cmd.config
    
        commandsData.push({
            name: cfg.name,
            description: cfg.description,
            cooldown: cfg.cooldown / 1000,
            active: cfg.active,
            admin: cfg.adminOnly
        })
}
module.exports = {commandsData}