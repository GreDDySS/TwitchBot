const TelegrmBot = require("node-telegram-bot-api")
// 916200887 chatid greddyss
const TClient = new TelegrmBot(greddBot.Config.tgToken, {polling: true})



TClient.onText(/\bot/, (msg, [match, source]) => {
    const chatID = msg.chat.id
    TClient.sendMessage(chatID, `Выберите команду`, {reply_markup: {commands}})
})