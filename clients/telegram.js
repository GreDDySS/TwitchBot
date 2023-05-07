const TelegrmBot = require("node-telegram-bot-api")
const bot = new TelegrmBot(greddBot.Config.tgToken, {polling: true})
const isAdmin = 916200887

const menu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Обновить праздник', callback_data: 'Celebration'}],
            [{text: 'Перезагрузить SevenTV', callback_data: 'SevenTV'}],
            [{text: 'Статистика', callback_data: 'Stats'}]
        ]
    })
}

bot.onText(/\/menu/, (msg, match) => {
    if (msg.chat.id !== isAdmin) return
    let reply = `
    🤖 Меню бота
    ⚪ Выбери исполняемую команду:`
    bot.sendMessage(msg.chat.id, reply, menu)
})

bot.onText(/\/message/, (msg, match) => {
    if (msg.chat.id !== isAdmin) return
    let reply = `
    🤖 Меню каналов
    ⚪ Выбери канал к котору подключится:`
    bot.sendMessage(msg.chat.id, reply, channels)
})

bot.on("callback_query", async (msg) => {
    var req = msg.data.split("_")
    var index = req[0]

    // Update celebration
    if (index == "Celebration") {
        await greddBot.Utils.celebration.getListCelebration()
        bot.sendMessage(msg.from.id, "🥳 Загрузл новые праздники!")
    }

    // Restart sevenTV events
    if (index == "SevenTV") {
        await greddBot.Seven.initialize()
        bot.sendMessage(msg.from.id, "🔄️ Перезагрузил sevenTV!")
    }

    // Check Stats bot
    if (index == "Stats") {
        const stats = await greddBot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
        const msgCount = stats.rows.map((item) => {return item.messageLine})
        const cmd = stats.rows.map((item) => {return item.cmdUsed})
        const used = process.memoryUsage().heapUsed / 1024 / 1024
        const memory = Math.round(used * 100) / 100
        const channelCount = await greddBot.Channel.getJoinable()
        let reply = `
        🔘Статистика бота
        ⌛️Время работы: ${greddBot.Utils.misc.uptime()}
        ▶️Отправленных сообщений: ${msgCount}
        ⚡Вызванных команд: ${cmd}
        #️⃣Использовано ОЗУ: ${memory}
        💬Подключено каналов: ${channelCount.length}
        `
        bot.sendMessage(msg.from.id, reply)
    }
})