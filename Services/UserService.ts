import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import type { User } from "../generated/prisma/client";

export class UserService {

    /**
     * Get user by ID
     * @param id provided by twitch
     * @returns User or null if not found
     */
    static async getUserById(id: string): Promise<User | null> {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            Logger.warn(`[UserService] Invalid user ID provided: ${id}`);
            return null;
        }

        try {
            return await prisma.user.findUnique({
                where: { id },
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to get user by ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Get user by username (case-insensitive)
     * @param username Twitch username to search for
     * @returns User object or null if not found
     */
    static async getUserByName(username: string): Promise<User | null> {
        if (!username || typeof username !== 'string') {
            Logger.warn(`[UserService] Invalid username provided: ${username}`);
            return null;
        }

        try {
            return await prisma.user.findFirst({
                where: { username: username.toLowerCase() },
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to get user by name ${username}: `, error);
            return null;
        }
    }

    /**
     * Create or update user profile
     * @param id Twitch user ID
     * @param username Twitch login name
     * @param displayName Twitch display name
     * @param color User color in chat
     * @returns Created/updated user object
     * @throws Error if database operation fails
     */
    static async createOrUpdate(id: string, username: string, displayName: string, color?: string): Promise<User> {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new Error('User ID is required');
        }
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            throw new Error('Username is required');
        }
        if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
            throw new Error('Display name is required');
        }
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            Logger.warn(`[UserService] Invalid color format: ${color}, using default`);
            color = undefined;
        }

        try {
            return await prisma.user.upsert({
                where: { id },
                update: {
                    username: username.toLowerCase(),
                    displayName,
                    ...(color && { color })
                },
                create: {
                    id,
                    username: username.toLowerCase(),
                    displayName,
                    color: color ?? "#FFFFFF",
                }
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to upsert user ${username} (${id}): `, error);
            throw error;
        }
    }

    /**
     * Increment user's message counter 
     * @param id Twitch user ID
     * @returns true if successful, false if the user is not found or an error occurs
    */
    static async incrementUserMessage(id: string): Promise<boolean> {
        if (!id || typeof id !== 'string') {
            Logger.warn(`[UserService] Invalid user ID for increment: ${id}`);
            return false;
        }

        try {
            await prisma.user.update({
                where: { id },
                data: {
                    messages: { increment: 1 }
                }
            });
            return true;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
                Logger.warn(`[UserService] User not found for increment: ${id}`);
                return false;
            }

            Logger.error(`[UserService] Failed to increment messages for user ${id}: `, error);
            return false;
        }
    }

    /**
     * Get top users by message count
     * @param limit Number of users to return
     * @returns Array of top users ordered by message count (descending)
     */
    static async getTopUsers(limit: number) {
        const validLimit = Math.max(1, Math.min(limit, 100));

        if (limit !== validLimit) {
            Logger.warn(`[UserService] Limit ${limit} adjusted to ${validLimit}`);
        }

        try {
            return await prisma.user.findMany({
                orderBy: { messages: 'desc' },
                take: limit
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to get top users: `, error);
            return [];
        }
    }
}