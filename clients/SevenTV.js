const EventSource = require("eventsource")
const pc = require("picocolors")
const Main = "https://events.7tv.io/v3@"
var source = null
var buffer = {
    'pushed': [],
    'pulled': []
}

const createEventSource = async () => {
    var channel = await bot.Channel.getSevenID()
    const url = `${Main},emote_set.update<object_id=${channel
        .map((item) => item)
        .join(">,emote_set.update<object_id=")}>`
    source = new EventSource(url)
}

const handleEvent = async (e) => {
    const data = JSON.parse(e.data)
    const channels = await bot.Channel.getSevenUsername(data.body.id)

    if (data.body.pushed){
        buffer.pushed.push(data.body.pushed[0].value.name)
        // bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Добавили эмоут ${data.body.pushed[0].value.name}`)
    }
    if (data.body.pulled){
        buffer.pulled.push(data.body.pulled[0].old_value.name)
        // bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Убрали эмоут ${data.body.pulled[0].old_value.name}`)
    }

    
    if (data.body.updated){
        bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Изменили эмоут ${data.body.updated[0].old_value.name} на ${data.body.updated[0].value.name}`)
    }
    
    const INTERVAL = 10 * 1000
    setTimeout(async () => {
        if (buffer.pulled.length > 0) {
            var emotesPulled = `${buffer.pulled.map((emote) => ` ${emote} `)}`
            bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Убрали эмоут ${emotesPulled}`)
            buffer.pulled = []
        }else{
            if (buffer.pushed.length > 0) {
                var emotesPushed = `${buffer.pushed.map((emote) => ` ${emote} `)}`
                bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Добавили эмоут ${emotesPushed}`)
                buffer.pushed = []
            }
            else {
                return
            }
        }
    }, INTERVAL);
}

const addListener = () => {
    source.addEventListener("dispatch", handleEvent, false)
}

const initialize = async () => {
    bot.Logger.info(`${pc.green("[SevenTV]")} || Connected to SevenTV 🟢`);
    if (source !== null) {
        source.close()
    }
    source = null
    await createEventSource().then(() => {
        addListener()
    })
}

module.exports = {initialize}