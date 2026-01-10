import { ChatClient, ChatMessage } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { authProvider, initializeAuth } from "../Auth/Auth";
import { Logger } from "../Utils/Logger";
import { getAllChannels } from "../Database/Channel";
import { Sender } from "../Utils/Sender";
import { CommandHandler } from "../Handlers/CommandHandler";
import config from "../Config/config";
import path from "path";
import { statsStore } from "../Utils/StatsStore";
import { CreateOrUpdateUser, incrementUserMessages } from "../Database/Users";
import { createMessageLog } from "../Database/Logs";
import { RuntimeConfig } from "../Config/RuntimeConfig";


const apiClient = new ApiClient({ authProvider })

const channelsNames = await getAllChannels().then((channel) => {
    statsStore.setModuleStatus('Database', 'online')
    statsStore.setChannelCount(channel.length)
    return channel.map(c => c.username)
})

export const chatClient = new ChatClient({
    authProvider,
    channels: channelsNames,
    isAlwaysMod: true,
    requestMembershipEvents: false,
    rejoinChannelsOnReconnect: true,
})

chatClient.onConnect(() => {
    Sender.send("greddyss", "Lurk");
    statsStore.setModuleStatus('Twitch', 'online');
    Logger.info("[TWITCH] Connected to chat! 🟢");
})

chatClient.onDisconnect((_, reason) => {
    statsStore.setModuleStatus('Twitch', 'offline');
    Logger.info(`[Twitch] Disconnected: ${reason} 🔴`)
})

chatClient.onMessage(async (channel: string, user: string, text: string, msg: ChatMessage) => {
    if (user === config.twitch.botUsername) return;
    statsStore.incrementMessage()

    if (!RuntimeConfig.disableDbWrites) {
        await CreateOrUpdateUser(
            msg.userInfo.userId, 
            msg.userInfo.userName, 
            msg.userInfo.displayName, 
            msg.userInfo.color
        );
    
        await incrementUserMessages(
            msg.userInfo.userId
        )
    
        await createMessageLog(
            text,
            msg.channelId!,
            msg.userInfo.userId,
            Array.from(msg.userInfo.badges.keys()),
            msg.userInfo.color
        )
    }
    

    await CommandHandler.handleMessage({ 
        channel, user, text, msg, args: [],
        send: async () => {},
        reply: async () => {}
        
    });
})

export const startTwitch = async () => {
    await initializeAuth();
    statsStore.setModuleStatus('Twitch', 'loading');

    try {
        await CommandHandler.loadCommands(path.join(process.cwd(), "/commands"));
        await chatClient.connect();
    }
    catch (e) {
        Logger.error("[Twitch] Failed to connect: ", e)
    }
}