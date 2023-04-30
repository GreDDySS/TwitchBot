const replies = [
    "😃 Бесспорно.",
    "😃 Предрешено.",
    "😃 Никаких сомнений.",
    "😃 Определённо, да.",
    "😃 Можешь быть уверен в этом.",
    "😃 Мне кажется - «да».",
    "😃 Вероятнее всего.",
    "😃 Да.",
    "😃 Знаки говорят - «да».",
    "😐 Пока не ясно, попробуй снова.",
    "😐 Спроси позже.",
    "😐 Лучше не рассказывать.",
    "😐 Сейчас нельзя предсказать.",
    "😦 Даже не думай.",
    "😦 Мой ответ - «нет».",
    "😦 По моим данным - «нет».",
    "😦 Весьма сомнительно.",
];

exports.run = async (client, chat, channel, commandData) => {
    chat.send(channel, `@${commandData.user.name}, ${greddBot.Utils.misc.randomArg(replies)}`)
}
module.exports.config = {
    name: "8ball",
    description: "Checks your question against the fortune-telling 8-ball",
    cooldown: 5000,
    aliases: [],
    active: true,
    adminOmnly: false
}