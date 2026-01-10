import { prisma } from ".";
import { Logger } from "../Utils/Logger";
import { statsStore } from "../Utils/StatsStore";

/**
 * Log a chat message to the database.
 */
export const createMessageLog = async (
    text: string,
    channelId: string,
    userId: string,
    badges: string[],
    color?: string
) => {
    try {
        await prisma.messageLog.create({
            data: {
                text,
                channelId,
                userId,
                badges,
                color: color || null,
                createdAt: new Date()
            }
        });

        statsStore.incrementDbQuery();

    } catch (error) {
        Logger.error(`[DB-LOG] Failed to log message from ${userId}: `, error);
        statsStore.incrementError();
    }
}
