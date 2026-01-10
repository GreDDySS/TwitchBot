import { ChatClient, ChatMessage } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { promises as fs } from "fs"
import { authProvider, iniitializeAuth } from "../Auth/Auth";
import config from "../Config/config";
import { Logger } from "../Utils/Logger";


const apiClient = new ApiClient({ authProvider })

const chatClient = new ChatClient({ 
    authProvider, 
    channels: ['greddyss'], 
    isAlwaysMod: true,
    requestMembershipEvents: false,
    rejoinChannelsOnReconnect: true, 
})

chatClient.onConnect(() => {
    // console.log("[Twitch] Connected to chat! 🟢")
    Logger.info("[TWITCH] Connected to chat! 🟢")
})

chatClient.onDisconnect((_, reason) => {
    // console.log(`[Twitch] Disconnected: ${reason} 🔴`)
    Logger.info(`[Twitch] Disconnected: ${reason} 🔴`)
})

chatClient.onMessage(async (channel: string, user: string, text: string, msg: ChatMessage) => {

    await chatClient.say("greddyss", "Я родился!")

    if (text === "`follow") {
        const brdID = msg.channelId!;
        const { data: [follow] } = await apiClient.channels.getChannelFollowers(brdID, msg.userInfo.userId);

        if (follow) {
			const currentTimestamp = Date.now();
			const followStartTimestamp = follow.followDate.getTime();
			chatClient.say(channel, `@${user} You have been following for ${(currentTimestamp - followStartTimestamp) / 1000}!`);
		} else {
			chatClient.say(channel, `@${user} You are not following!`);
		}
    }
})

export const startTwitch = async () => {
    await iniitializeAuth();
    try {
        await chatClient.connect();
    }
    catch (e) {
        // console.error("[Twitch] Failed to connect: ", e)
        Logger.error("[Twitch] Failed to connect: ", e)
    }
}