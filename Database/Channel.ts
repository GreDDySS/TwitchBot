import { prisma } from ".";
import { Logger } from "../Utils/Logger";

/**
 * Get a list of all channels.
 * Used when starting the bot to connect to chats.
 */
export const getAllChannels = async () => {
    try {
        return await prisma.channel.findMany();
    } catch (error) {
        Logger.error("[DB] Failed get list channels: ", error);
        return [];
    }
}

/**
 * Get the channel by name (username).
 */
export const getChannelByName = async (username: string) => {
    return await prisma.channel.findUnique({
        where: { username: username.toLowerCase() },
    });
}

/**
 * Add a new channel to the database.
 * @param id Twitch channel ID (it is important to store the ID, as the nickname may change)
 * @param username Channel name
 */
export const addChannel = async (id: string, username: string) => {
    return await prisma .channel.create({
        data: {
            id,
            username: username.toLowerCase(),
            joinedDate: new Date(),
        }
    })
}

/**
 * Remove channel from bot.
 */
export const removeChannel = async (id: string) => {
    return await prisma.channel.delete({
        where: { id },
    })
}

/**
 * Update channel settings (e.g., prefix).
 */
export const updateChannelConfig = async (
    id: string, 
    settings: { prefix?: string, logging?: boolean, sevenTVEvents?: boolean}
) => {
    return await prisma.channel.update({
        where: { id },
        data: settings,
    })
}