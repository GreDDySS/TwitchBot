import { prisma } from ".";
import { Logger } from "../Utils/Logger";
import { statsStore } from "../Utils/StatsStore";

/**
 * Log an error to the database.
 */
export const createErrorLog = async (name: string, message: string, stack?: string) => {

    prisma.logError.create({
        data: {
            name,
            message,
            stack,
            date: new Date()
        }
    }).then(() => {
        statsStore.incrementDbQuery();
    }).catch(err => {
        console.error("[DB-ERR-LOG] Failed to write error to DB:", err);
    });
}
