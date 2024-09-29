const TwitchPubSub = require("twitchps")
const pc = require("picocolors")

const pubsub = new TwitchPubSub({
    init_topics: [{topic: `video-playback.${bot.Config.owner},video-playback.borobushe`}],
    reconnect: true,
    debug: false
})

pubsub.on('connected', () => {
	bot.Logger.info(`${pc.green("[PUBSUB]")} || Connected to PubSub 🟢`);
});

pubsub.on('disconnected', () => {
	bot.Logger.warn(`${pc.red("[PUBSUB]")} || Disconnected from PubSub 🔴`);
});

pubsub.on('reconnect', () => {
	bot.Logger.info(`${pc.green("[PUBSUB]")} || Reconnecting to PubSub...`);
});

pubsub.on('stream-up', async (data) => {
    console.log(data)
    // client.say("greddyss", `/announce Стрим начался`)
})

pubsub.on('stream-down', async (data) => {
    // client.say("greddyss", `/announce Стрим закончился`)
})