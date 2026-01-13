import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import { BaseService } from "./BaseService";
import type { User } from "../generated/prisma/client";

export class UserService extends BaseService{

    /**
     * Get user by ID
     * @param id provided by twitch
     * @returns User or null if not found
     */
    static async getUserById(id: string): Promise<User | null> {
        const validId = this.validateId(id, 'user')
        if (!validId) return null;

        try {
            return await prisma.user.findUnique({
                where: { id: validId },
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to get user by ID ${validId}:`, error);
            return null;
        }
    }

    /**
     * Get user by username (case-insensitive)
     * @param username Twitch username to search for
     * @returns User object or null if not found
     */
    static async getUserByName(username: string): Promise<User | null> {
        const validUsername = this.validateString(username, 'username');
        if (!validUsername) {
            return null;
        }

        try {
            return await prisma.user.findFirst({
                where: { username: validUsername.toLowerCase() },
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to get user by name ${validUsername}: `, error);
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
        const validId = this.validateId(id, 'user');
        if (!validId) throw new Error('User ID is required');

        const validUsername = this.validateString(username, 'username');
        if (!validUsername) throw new Error('Username is required');

        const validDisplayName = this.validateString(displayName, 'displayName');
        if (!validDisplayName) throw new Error('Display name is required');

        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            Logger.warn(`[UserService] Invalid color format: ${color}, using default`);
            color = undefined;
        }

        try {
            return await prisma.user.upsert({
                where: { id: validId },
                update: {
                    username: validUsername,
                    displayName: validDisplayName,
                    ...(color && { color })
                },
                create: {
                    id,
                    username: validUsername,
                    displayName: validDisplayName,
                    color: color ?? "#FFFFFF",
                }
            });
        } catch (error) {
            Logger.error(`[UserService] Failed to upsert user ${validUsername} (${validId}): `, error);
            throw error;
        }
    }

    /**
     * Increment user's message counter 
     * @param id Twitch user ID
     * @returns true if successful, false if the user is not found or an error occurs
    */
    static async incrementUserMessage(id: string): Promise<boolean> {
        const validId = this.validateId(id, 'user');
        if (!validId) {
            return false;
        }

        try {
            await prisma.user.update({
                where: { id: validId },
                data: {
                    messages: { increment: 1 }
                }
            });
            return true;
        } catch (error: unknown) {
            if (this.isPrismaError(error, 'P2025')) {
                Logger.warn(`[UserService] User not found for increment: ${validId}`);
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
        const validLimit = this.clampNumber(limit, 1, 100, 10);

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
    
    static async createOrUpdateWithMessage(id: string, username: string, displayName: string, color?: string): Promise<User> {
        const user = await this.createOrUpdate(id, username, displayName, color);
        await this.incrementUserMessage(id);
        return user;
    }
}