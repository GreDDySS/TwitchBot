import { redis } from "../Utils/Redis";
import { Logger } from "../Utils/Logger";
import { MessageLogService } from "./MessageLogService";
import { RuntimeConfig } from "../Config/RuntimeConfig";

interface QueuedMessage {
    text: string;
    channelId: string;
    userId: string;
    badges: string[];
    color: string;
    timestamp: number;
}

const REDIS_QUEUE_KEY = "message_log_queue";
const BATCH_SIZE = 25;
const FLUSH_INTERVAL = 5000;

export class MessageQueueService {
    private static flushInterval?: ReturnType<typeof setInterval>;
    private static isProcessing = false;

   
    static async enqueue(text: string, channelId: string, userId: string, badges: string[], color: string): Promise<void> {
        if (RuntimeConfig.disableDbWrites) {
            return;
        }

        const message: QueuedMessage = {text, channelId,userId, badges, color, timestamp: Date.now()};

        try {
            await redis.lpush(REDIS_QUEUE_KEY, JSON.stringify(message));
        } catch (err) {
            Logger.error("[MessageQueue] Failed to enqueue message:", err);
        }
    }

    static async flush(): Promise<void> {
        if (this.isProcessing || RuntimeConfig.disableDbWrites) {
            return;
        }

        this.isProcessing = true;

        try {
            const queueLength = await redis.llen(REDIS_QUEUE_KEY);
            
            if (queueLength === 0) {
                this.isProcessing = false;
                return;
            }

            const count = Math.min(queueLength, BATCH_SIZE);
            const messages = await redis.lrange(REDIS_QUEUE_KEY, 0, count - 1);
            
            if (messages.length === 0) {
                this.isProcessing = false;
                return;
            }

            const parsedMessages: QueuedMessage[] = [];
            for (const msg of messages) {
                try {
                    parsedMessages.push(JSON.parse(msg));
                } catch (err) {
                    Logger.warn("[MessageQueue] Failed to parse message:", err);
                }
            }

            for (const msg of parsedMessages) {
                await MessageLogService.create(msg.text, msg.channelId, msg.userId, msg.badges, msg.color);
            }

            await redis.del(REDIS_QUEUE_KEY);
            
            if (queueLength > count) {
                const remaining = await redis.lrange(REDIS_QUEUE_KEY, 0, -1);
                for (const msg of remaining.reverse()) {
                    await redis.lpush(REDIS_QUEUE_KEY, msg);
                }
            }

            Logger.debug(`[MessageQueue] Flushed ${parsedMessages.length} messages to DB`);
        } catch (err) {
            Logger.error("[MessageQueue] Failed to flush queue:", err);
        } finally {
            this.isProcessing = false;
        }
    }

    static start(): void {
        if (this.flushInterval) {
            return;
        }

        this.flushInterval = setInterval(() => {
            this.flush().catch(err => {
                Logger.error("[MessageQueue] Error in flush interval:", err);
            });
        }, FLUSH_INTERVAL);

        Logger.info("[MessageQueue] Started periodic flush");
    }

    static stop(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = undefined;
        }

        this.flush().catch(err => {
            Logger.error("[MessageQueue] Error in final flush:", err);
        });

        Logger.info("[MessageQueue] Stopped");
    }
    
    static async getQueueSize(): Promise<number> {
        try {
            return await redis.llen(REDIS_QUEUE_KEY);
        } catch (err) {
            Logger.error("[MessageQueue] Failed to get queue size:", err);
            return 0;
        }
    }
}