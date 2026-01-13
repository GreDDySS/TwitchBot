import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import { statsStore } from "../Utils/StatsStore";
import { BaseService } from "./BaseService";

export class MessageLogService extends BaseService{
    /**
     * Log a chat message to the database
     * @param text The message content
     * @param channelId Twitch channel ID where message was sent
     * @param userId Twitch user ID who sent the message
     * @param badges Array of user badges (subscriber, moderator, etc.)
     * @param color User's chat color
     */
    static async create(text: string, channelId: string, userId: string, badges: string[], color: string): Promise<void> {
        const validText = this.validateString(text, 'message text');
        if (!validText) {
            return;
        }

        const validChannelId = this.validateId(channelId, 'channel');
        if (!validChannelId) {
            return;
        }

        const validUserId = this.validateId(userId, 'user');
        if (!validUserId) {
            return;
        }

        if (!Array.isArray(badges)) {
            Logger.warn(`[MessageLogService] Invalid badges array`);
            return;
        }

        try {
            await prisma.messageLog.create({
                data: {
                    text: validText,
                    channelId: validChannelId,
                    userId: validUserId,
                    badges,
                    color: color || null,
                    createdAt: new Date(),
                }
            });

            statsStore.incrementDbQuery();
        } catch (error) {
            Logger.error(
                `[MessageLogService] Failed to log message from ${validUserId}:${validChannelId}`, 
                error
            );
            statsStore.incrementError();
        }
    }
}