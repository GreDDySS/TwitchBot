import Redis from "ioredis";
import config from "../Config/config";
import { Logger } from "./Logger";
import { statsStore } from "./StatsStore";

let redisInstance: Redis | null = null;

function trackRedisQuery<T>(promise: Promise<T>): Promise<T> {
    statsStore.incrementRedisQuery();
    return promise;
}

export function getRedis(): Redis {
    if (!redisInstance) {
        statsStore.setModuleStatus('Redis', 'loading');
        redisInstance = new Redis(config.redis.url, {
            maxRetriesPerRequest: 3,
            connectTimeout: 5000,
            lazyConnect: true,
            enableOfflineQueue: false,
        });

        redisInstance.on("error", (err) => {
            Logger.error("[REDIS] Failed to connect: ", err);
            statsStore.setModuleStatus('Redis', 'error');
        })

        redisInstance.on("connect", () => {
            Logger.info("[Redis] Successfully connected!")
            statsStore.setModuleStatus('Redis', 'online');
        });
    }

    return redisInstance;
}

export async function initRedis(): Promise<void> {
    const redis = getRedis();
    try {
        await redis.connect();
        Logger.info("[REDIS] Connection initialized");
    } catch (err) {
        Logger.error("[REDIS] Failed to initialize connection:", err);
        statsStore.setModuleStatus('Redis', 'error');
    }
}

export async function closeRedis(): Promise<void> {
    if (redisInstance) {
        await redisInstance.quit();
        redisInstance = null;
        Logger.info("[REDIS] Connection closed");
    }
}

export const redis = {
    get instance() {
        return getRedis();
    },

    async lpush(key: string, ...values: (string | number)[]): Promise<number> {
        return trackRedisQuery(getRedis().lpush(key, ...values));
    },
    
    async llen(key: string): Promise<number> {
        return trackRedisQuery(getRedis().llen(key));
    },
    
    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return trackRedisQuery(getRedis().lrange(key, start, stop));
    },
    
    async del(...keys: string[]): Promise<number> {
        return trackRedisQuery(getRedis().del(...keys));
    },
    
    async exists(key: string): Promise<number> {
        return trackRedisQuery(getRedis().exists(key));
    },
    
    async setex(key: string, seconds: number, value: string): Promise<string> {
        return trackRedisQuery(getRedis().setex(key, seconds, value));
    },
    
    // Добавить другие методы по мере необходимости
    async quit(): Promise<string> {
        return getRedis().quit();
    }
}