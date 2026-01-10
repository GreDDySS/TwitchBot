import { prisma } from ".";
import { Logger } from "../Utils/Logger";

/**
 * Get a user by their Twitch ID.
 */
export const getUserById = async (id: string) => {
    try {
        return await prisma.user.findUnique({
            where: { id }
        });
    } catch (error) {
        Logger.error(`[DB-USER] Failed to get user by ID ${id}: `, error);
        return null;
    }
}

/**
 * Get a user by their Username.
 */
export const getUserByName = async (username: string) => {
    try {
        return await prisma.user.findUnique({
            where: { username: username.toLowerCase() }
        });
    } catch (error) {
        Logger.error(`[DB-USER] Failed to get user by name ${username}: `, error);
        return null;
    }
}

/**
 * Create a new user or update if they already exist (Upsert).
 * This is useful to keep display names and colors up to date.
 */
export const CreateOrUpdateUser = async (id: string, username: string, displayName: string, color?: string) => {
    try {
        return await prisma.user.upsert({
            where: { id },
            update: {
                username: username.toLowerCase(),
                displayName,
                color: color
            },
            create: {
                id,
                username: username.toLowerCase(),
                displayName,
                color: color
            }
        });
    } catch (error) {
        Logger.error(`[DB-USER] Failed to upsert user ${username}: `, error);
        throw error;
    }
}

/**
 * Increment the message counter for a user.
 */
export const incrementUserMessages = async (id: string) => {
    try {
        return await prisma.user.update({
            where: { id },
            data: {
                messages: { increment: 1 }
            }
        });
    } catch (error) {
        Logger.error(`[DB-USER] Failed to increment messages for user ${id}: `, error);
    }
}

/**
 * Get top users by message count.
 */
export const getTopUsers = async (limit: number = 10) => {
    try {
        return await prisma.user.findMany({
            orderBy: { messages: 'desc' },
            take: limit
        });
    } catch (error) {
        Logger.error(`[DB-USER] Failed to get top users: `, error);
        return [];
    }
}
