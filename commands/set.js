exports.run = async (client, chat, channel, commandData) => {
    const args = commandData.message.args
    const userna = args[1].toLowerCase();
    let result = 0
    // Convert boolean in int for sql
    if (args[2] == "true"){
        result = 1
    }
    if (args[2] == "fasle") {
        result = 0
    }

    if(args[0] === "ignore") {
        await greddBot.DB.db.query(`Update channel Set "ignore" = '${result}' Where "name" = '${userna}'`)

            if(args[2] == "true") {
                chat.sendCommand(channel, `/me FeelsOkayMan 👍 Данный канал ${userna} добавлен в список игнориремых.`)
            }
            if(args[2] == "false") {
                chat.sendCommand(channel, `/me FeelsOkayMan 👍 Данный канал ${userna} убран из списка игнориремых.`)
            }
        
    }
    
    if(args[0] === "7tv") {
        await greddBot.DB.db.query(`Update channel Set "sevenTV" = '${result}' Where "name" = '${userna}'`)
            if(args[2] == "true") {
                chat.sendCommand(channel, `/me FeelsOkayMan 👍 На каналe ${userna} включены эвенты 7TV.`)
                greddBot.Seven.initialize()
            }
            if(args[2] == "false") {
                chat.sendCommand(channel, `/me FeelsOkayMan 👍 На каналe ${userna} выключены эвенты 7TV.`)
                greddBot.Seven.initialize()
            }
    }
    if(args[0] == "7id") {
        await greddBot.DB.db.query(`Update channel Set "sevenID" = '${args[2]}' Where "name" = '${userna}'`)
        chat.sendCommand(channel, `/me FeelsOkayMan 👍 Обновлён 7TV-id для ${userna}`)
        greddBot.Seven.initialize()
    }
}
module.exports.config = {
    name: "set",
    description: "Set settings user/channel in database",
    cooldown: 500,
    aliases: ["test"],
    active: true,
    adminOmnly: true
}