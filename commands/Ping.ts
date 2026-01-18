import { statsStore } from "../Utils/StatsStore";
import type { ICommand } from "../Utils/types";

export default {
    name: "ping",
    aliases: ["p"],
    description: "Check latency bot",
    cooldown: 5,
    
    async execute({send, reply, user, text, args, msg}) {
        const stats = await statsStore.getStats()
        
        await send(`@${user}, PONG! · Uptime: ${stats["uptime"]} · RAM: ${stats["memoryUsage"]["heapUsed"]}MB · Messages: ${stats["messages"]} · Cmd: ${stats["commands"]} · Channels: ${stats["channels"]} · DB Querys ${stats["dbQueries"]} · Redis: ${stats["redisQueries"]}`)
    }
} as ICommand