import { prisma } from "../Database";
import { Logger } from "../Utils/Logger";
import { statsStore } from "../Utils/StatsStore";

export class ErrorLogService {
    /**
     * Create a new error log entry in the database
     * @param name Error type/name (e.g., "TypeError", "ValidationError")
     * @param message Descriptive error message
     * @param stack Optional error stack trace for debugging
     */
    static async create(name: string, message: string, stack?: string | null) {
       try {
            await prisma.logError.create({
                data: {
                    name,
                    message,
                    stack: stack ?? null,
                    date: new Date(),
                },
            })
        } catch (error) {
            console.error(`[ErrorLogService] Failed to write an error to the database: ${name} - ${message}`, error);
            return;
        }

        statsStore.incrementDbQuery();
    }

    /**
     * Create error log entry from JavaScript Error object with optional context
     * @param error Error object or unknown value to log 
     * @param context Optional context description to prepend to error message 
     */
    static async fromError(error: Error | unknown, context?: string) {
        const name = error instanceof Error ? error.name : 'UnknownError';
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;

        await this.create(
        name,
        context ? `${context}: ${message}` : message,
        stack,
        );
    }

    /**
     * Retrieve recent error logs from the database
     * @param limit Maximum number of error logs to retrieve (default: 50, max: 500)
     * @returns Array of error log objects, ordered by most recent first
     */
    static async getRecent(limit: number = 50) {
        const validLimit = Math.max(1, Math.min(limit, 500));
        if (limit !== validLimit) {
            Logger.warn(`[ErrorLogService] Limit ${limit} adjusted to ${validLimit}`);
        }
        
        try {
            return await prisma.logError.findMany({
                orderBy: { date: 'desc' },
                take: validLimit,
                select: {
                id: true,
                name: true,
                message: true,
                stack: true,
                date: true,
                },
            });
        } catch (error) {
            console.error('[ErrorLogService] Error receiving error logs', error);
            return [];
        }
    }

    //TODO: Maybe new method pangination
}