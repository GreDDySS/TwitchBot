const fs = require('fs');

const CMD_DIR = "./commands"
const FILES = fs.readdirSync(CMD_DIR)
const commandsData = []

for (const file of FILES) {
    const cmd = require(CMD_DIR + "/" + file)
    const cfg = cmd.config
    for (var i = 0; i < FILES.length; i++) {
        commandsData.push({
            name: cfg.name,
            description: cfg.description,
            cooldown: cfg.cooldown,
            active: cfg.active,
            admin: cfg.adminOnly
        })
    }
}

module.exports = {commandsData}