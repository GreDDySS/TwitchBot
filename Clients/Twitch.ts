import { ChatClient, ChatMessage } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { authProvider, initializeAuth } from "../Auth/Auth";
import { Logger } from "../Utils/Logger";
import { Sender } from "../Utils/Sender";
import { CommandHandler } from "../Handlers/CommandHandler";
import config from "../Config/config";
import path from "path";
import { statsStore } from "../Utils/StatsStore";
import { RuntimeConfig } from "../Config/RuntimeConfig";
import { sleep } from 'bun';
import { UserService } from "../Services/UserService";
import { MessageLogService } from "../Services/MessageLogService";
import { ChannelService } from "../Services/ChannelService";
import { MessageQueueService } from "../Services/MessageQueueService";


const apiClient = new ApiClient({ authProvider })

let channelsNames: string[] = [];
let retries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;


try {
    const channelsDB = await ChannelService.getAll();
    statsStore.setModuleStatus('Database', 'online');
    statsStore.setChannelCount(channelsDB.length);
    channelsNames = channelsDB.map(c => c.username);
} catch (error) {
    Logger.error("[TWITCH] Failed to load channels from DB:", error);
    statsStore.setModuleStatus('Database', 'error');
    Logger.warn(`[TWITCH] Using fallback channels from config: ${config.twitch.channels}`)
    channelsNames = config.twitch.channels
}

export const chatClient = new ChatClient({
    authProvider,
    channels: channelsNames,
    isAlwaysMod: true,
    requestMembershipEvents: false,
    rejoinChannelsOnReconnect: true,
})


chatClient.onConnect(() => {
    Sender.send(config.twitch.owner, "Lurk");
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
        await UserService.createOrUpdateWithMessage(
            msg.userInfo.userId, 
            msg.userInfo.userName, 
            msg.userInfo.displayName, 
            msg.userInfo.color
        )
    
        const channelId = msg.channelId;
        if (channelId) {
            await MessageQueueService.enqueue(
                text,
                channelId,
                msg.userInfo.userId,
                Array.from(msg.userInfo.badges.keys()),
                msg.userInfo.color || "#FFFFFF"
            );
        } else {
            Logger.warn(`[TWITCH] Message without channelId from ${user}`);
        }
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

    MessageQueueService.start()

    while (retries < MAX_RETRIES) {
        try {
            await CommandHandler.loadCommands(path.join(process.cwd(), "/commands"));
            await chatClient.connect();
            statsStore.setModuleStatus('Twitch', 'online');
            return;
        } catch (error: unknown) {
            retries++;
            Logger.error(`[Twitch] Failed to connect (attempt ${retries}/${MAX_RETRIES}):`, error);
            
            if (retries >= MAX_RETRIES) {
                statsStore.setModuleStatus('Twitch', 'error');
                throw new Error(`Failed to connect after ${retries} attempts`);
            }
            
            await sleep(RETRY_DELAY * retries);
        }
    }
}