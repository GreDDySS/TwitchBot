import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import type { Channel } from "../generated/prisma/client";
import { BaseService } from "./BaseService";

export class ChannelService extends BaseService {
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
        const validUsername = this.validateString(username, 'channel username');
        if (!validUsername) {
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { username: validUsername.toLowerCase() },
            });
        } catch (error) {
            Logger.error(`[ChannelService] Failed to get channel by name ${validUsername}:`, error);
            return null;
        }
    };

    /**
     * Get channel by twitch ID
     * @param id Twitch channel ID
     * @returns Channel object or null if not found
     */
    static async getById(id: string): Promise<Channel | null> {
        const validId = this.validateId(id, 'channel');
        if (!validId) {
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { id: validId },
            });
        } catch (error) {
            Logger.error(`[ChannelService] Failed to get channel by ID ${validId}:`, error);
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
        const validId = this.validateId(id, 'channel');
        if (!validId) {
            throw new Error('Channel ID is required');
        }

        const validUsername = this.validateString(username, 'channel username');
        if (!validUsername) {
            throw new Error('Channel username is required');
        }

        try {
            return await prisma.channel.create({
                data: {
                    id: validId,
                    username: validUsername.toLowerCase(),
                    joinedDate: new Date(),
                },
            });
        } catch (error: unknown) {
            if (this.isPrismaError(error, 'P2002')) {
                Logger.warn(`[ChannelService] Channel ${validUsername} already exists`);
                throw new Error(`Channel ${validUsername} already exists`);
            }

            Logger.error(`[ChannelService] Failed to add channel ${validUsername} (${validId}):`, error);
            throw error;
        }
    }

    /**
     * Remove a channel from the database
     * @param id Twitch channel ID to remove
     * @returns if deletion succesful, false otherwise
     */
    static async remove(id: string): Promise<boolean> {
       const validId = this.validateId(id, 'channel');
        if (!validId) {
            return false;
        }

        try {
            await prisma.channel.delete({
                where: { id: validId }
            });
            return true;
        } catch (error: unknown) {
            if (this.isPrismaError(error, 'P2025')) {
                Logger.warn(`[ChannelService] Channel not found for removal: ${validId}`);
                return false;
            }

            Logger.error(`[ChannelService] Failed to remove channel ${validId}:`, error);
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
        const validId = this.validateId(id, 'channel');
        if (!validId) {
            return null;
        }

        // Валидация настроек (специфичная для ChannelService)
        if (settings.prefix !== undefined) {
            const validPrefix = this.validateString(settings.prefix, 'prefix');
            if (!validPrefix) {
                Logger.warn(`[ChannelService] Invalid prefix: ${settings.prefix}`);
                return null;
            }
            settings.prefix = validPrefix;
        }

        try {
            return await prisma.channel.update({
                where: { id: validId },
                data: settings,
            });
        } catch (error: unknown) {
            if (this.isPrismaError(error, 'P2025')) {
                Logger.warn(`[ChannelService] Channel not found for update: ${validId}`);
                return null;
            }

            Logger.error(`[ChannelService] Failed to update channel settings ${validId}:`, error);
            return null;
        }
    }

    /**
     * Check if channel is registered in the database
     * @param id Twitch channel ID to check
     * @returns Boolean indicating if channel exists in database
     */
    static async isJoined(id: string): Promise<boolean> {
       const validId = this.validateId(id, 'channel');
        if (!validId) {
            return false;
        }

        try {
            const count = await prisma.channel.count({
                where: { id: validId }
            });
            return count > 0;
        } catch (error) {
            Logger.error(`[ChannelService] Failed to check if channel is joined ${validId}:`, error);
            return false;
        }
    }

    /**
     * Get channel with related stats and annoucemencts
     * @param id Twitch channel ID
     * @returns Channel object with included stats and announcements relations
     */
    static async getWithStats(id: string) {
        const validId = this.validateId(id, 'channel');
        if (!validId) {
            return null;
        }

        try {
            return await prisma.channel.findUnique({
                where: { id: validId },
                include: {
                    stats: true,
                    announces: true,
                }
            });
        } catch (error) {
            Logger.error(`[ChannelService] Failed to get channel with stats ${validId}:`, error);
            return null;
        }
    }

    static async getPrefix(id: string): Promise<string | null> {
        const validId = this.validateId(id, 'channel');
        if (!validId) {
            return null;
        }

        try {
            const data = await prisma.channel.findUnique({
                where: { id: validId },
            })
            return data?.prefix ?? null
        } catch (error) {
            Logger.error(`[ChannelService] Failed to get channel prefix ${validId}:`, error)
            return null
        }

    }
}

