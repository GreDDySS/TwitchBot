const EventSource = require("eventsource")
const pc = require("picocolors")
const Main = "https://events.7tv.io/v3@"
var source = null

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
        bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Добавили эмоут ${data.body.pushed[0].value.name}`)
    }
    if (data.body.pulled){
        bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Убрали эмоут ${data.body.pulled[0].old_value.name}`)
    }
    if (data.body.updated){
        bot.Utils.command.sendCommand(channels[0], `/me [7TV] - Изменили эмоут ${data.body.updated[0].old_value.name} на ${data.body.updated[0].value.name}`)
    }
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