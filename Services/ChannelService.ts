import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import type { Channel } from "../generated/prisma/client";

export class ChannelService {
    /**
     * Get all channels in alphabetical order by username
     * @returns Array of all channel object< sorted ascending by username
     */
    static async getAll(): Promise<Channel[]> {
        try {
            return await prisma.channel.findMany({
                orderBy: { username: 'asc'},
            });
        } catch (error) {
            Logger.error("[ChannelService] Failed get list channels: ", error);
            return [];
        }
    };

    /**
     * Get channel by username (case-insensitive)
     * @param username Channel's Twitch username
     * @returns object or null if not found
     */
    static async getByName(username: string): Promise<Channel | null> {
        if (!username || typeof username !== 'string') {
            Logger.warn(`[ChannelService] Invalid username: ${username}`);
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { username: username.toLowerCase() },
            });
        } catch (error) {
            Logger.error(`[ChannelService] Channel search error ${username}`, error);
            return null;
        }
    };

    /**
     * Get channel by twitch ID
     * @param id Twitch channel ID
     * @returns Channel object or null if not found
     */
    static async getById(id: string): Promise<Channel | null> {
         if (!id || typeof id !== 'string') {
            Logger.warn(`[ChannelService] Invalid channel ID: ${id}`);
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { id },
            });
        } catch (error) {
            Logger.error(`[ChannelService] Channel search error by ID: ${id}`, error);
            return null;
        }
    }

    /**
     * Add a new channel to the database
     * @param id Twitch channel ID
     * @param username Channel's Twitch username (Broadcaster username)
     * @returns Created channel object
     * @throws Error if database operation fails
     */
    static async add(id: string, username: string): Promise<Channel> {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('Channel ID is required');
        }
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            throw new Error('Channel username is required');
        }

        try {
            return await prisma.channel.create({
                data: {
                    id,
                    username: username.toLowerCase(),
                    joinedDate: new Date(),
                },
            });
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
                Logger.warn(`[ChannelService] Channel ${username} already exists`);
                throw new Error(`Channel ${username} already exists`);
            }

            Logger.error(`[ChannelService] Failed to add channel ${username} (${id}):`, error);
            throw error;
        }
    }

    /**
     * Remove a channel from the database
     * @param id Twitch channel ID to remove
     * @returns if deletion succesful, false otherwise
     */
    static async remove(id: string): Promise<boolean> {
        if (!id || typeof id !== 'string') {
            Logger.warn(`[ChannelService] Invalid channel ID for removal: ${id}`);
            return false;
        }

        try {
            await prisma.channel.delete({
                where: { id }
            })
            return true;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
                Logger.warn(`[ChannelService] Channel not found for removal: ${id}`);
                return false;
            }

            Logger.error(`[ChannelService] Failed to remove channel ${id}:`, error);
            return false;
        }
    }

    /**
     * Update channel configuration settings
     * @param id Twitch channel ID
     * @param settings Configuration object with optional fields to update
     * @param settings.prefix Custom command prefix
     * @param settings.logging Enable/disable chat logging
     * @param settings.sevenTVEvents Enable/disable 7TV event handling
     * @returns Updated channel object or null if update fails
     */
    static async updateConfig(id: string, settings: { prefix?: string, logging?: boolean, sevenTVEvents?: boolean}): Promise<Channel | null> {
         if (!id || typeof id !== 'string') {
            Logger.warn(`[ChannelService] Invalid channel ID for update: ${id}`);
            return null;
        }

        if (settings.prefix !== undefined && typeof settings.prefix !== 'string') {
            Logger.warn(`[ChannelService] Invalid prefix type: ${settings.prefix}`);
            return null;
        }

        try {
            return await prisma.channel.update({
                where: { id },
                data: settings,
            });
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
                Logger.warn(`[ChannelService] Channel not found for update: ${id}`);
                return null;
            }

            Logger.error(`[ChannelService] Failed to update channel settings ${id}:`, error);
            return null;
        }
    }

    /**
     * Check if channel is registered in the database
     * @param id Twitch channel ID to check
     * @returns Boolean indicating if channel exists in database
     */
    static async isJoined(id: string): Promise<boolean> {
        if (!id || typeof id !== 'string') {
            return false;
        }

        try {
            const count = await prisma.channel.count({
                where: { id }
            });
            return count > 0;
        } catch (error) {
            Logger.error(`[ChannelService] Error checking if channel is joined: ${id}`, error);
            return false;
        }
    }

    /**
     * Get channel with related stats and annoucemencts
     * @param id Twitch channel ID
     * @returns Channel object with included stats and announcements relations
     */
    static async getWithStats(id: string) {
        if (!id || typeof id !== 'string') {
            Logger.warn(`[ChannelService] Invalid channel ID for getWithStats: ${id}`);
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { id },
                include: {
                    stats: true,
                    announces: true,
                }
            });
        } catch (error) {
            Logger.error(`[ChannelService] Error getting channel with stats: ${id}`, error);
            return null;
        }
    }
}

