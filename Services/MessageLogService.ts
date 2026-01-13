import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import { statsStore } from "../Utils/StatsStore";

export class MessageLogService {
    /**
     * Log a chat message to the database
     * @param text The message content
     * @param channelId Twitch channel ID where message was sent
     * @param userId Twitch user ID who sent the message
     * @param badges Array of user badges (subscriber, moderator, etc.)
     * @param color User's chat color
     */
    static async create(text: string, channelId: string, userId: string, badges: string[], color: string): Promise<void> {
        if (!text || typeof text !== 'string') {
            Logger.warn(`[MessageLogService] Invalid text for message log`);
            return;
        }
        if (!channelId || typeof channelId !== 'string') {
            Logger.warn(`[MessageLogService] Invalid channelId for message log`);
            return;
        }
        if (!userId || typeof userId !== 'string') {
            Logger.warn(`[MessageLogService] Invalid userId for message log`);
            return;
        }
        if (!Array.isArray(badges)) {
            Logger.warn(`[MessageLogService] Invalid badges array for message log`);
            return;
        }

        try {
            await prisma.messageLog.create({
                data: {
                    text,
                    channelId,
                    userId,
                    badges,
                    color,
                    createdAt: new Date(),
                }
            })
            statsStore.incrementDbQuery();


        } catch (error) {
            Logger.error(`[MessageLogService] Failed to log message from ${userId}:${channelId}`, error);
            statsStore.incrementError();
        }
    }
}