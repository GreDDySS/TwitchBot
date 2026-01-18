import { EventEmitter } from "events";
import { MessageQueueService } from "../Services/MessageQueueService";

export type ModuleStatus = 'online' | 'offline' | 'error' | 'loading';

class StatsStore extends EventEmitter {
    private startTime: number = Date.now();
    private uniqueUsers = new Set<string>();
    private uptimeInterval?: ReturnType<typeof setInterval>;
    private systemStatsInterval?: ReturnType<typeof setInterval>;

    private messagesLastMinute: number[] = [];
    private commandsLastMinute: number[] = [];

    private stats = {
        messages: 0,
        commands: 0,
        commandsLoaded: 0,
        uptime: "00:00:00",
        channels: 0,
        dbQueries: 0,
        redisQueries: 0,
        errors: 0,
        uniqueUsersCount: 0,
        messagesPerSecond: 0,
        commandsPerMinute: 0,
        memoryUsage: {
            heapUsed: 0,
            heapTotal: 0,
            rss: 0,
            external: 0,
        },
        modules: {
            Twitch: 'loading' as ModuleStatus,
            Database: 'loading' as ModuleStatus,
            SevenTV: 'offline' as ModuleStatus,
            Telegram: 'offline' as ModuleStatus,
            EventSub: 'offline' as ModuleStatus,
            Redis: 'loading' as ModuleStatus,
        }
    };

    constructor() {
        super();
        this.uptimeInterval = setInterval(() => this.updateUptime(), 1000);
        this.systemStatsInterval = setInterval(() => this.updateSystemStats(), 2000);
    }

    destroy() {
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
            this.uptimeInterval = undefined;
        }
        if (this.systemStatsInterval) {
            clearInterval(this.systemStatsInterval);
            this.systemStatsInterval = undefined;
        }
    }

    incrementMessage() {
        this.stats.messages++;
        this.emitChange();
    }

    incrementCommandUsage() {
        this.stats.commands++;
        this.emitChange();
    }
    
    incrementCommandLoad() {
        this.stats.commandsLoaded++;
        this.emitChange();
    }

    incrementDbQuery() {
        this.stats.dbQueries++;
        this.emitChange();
    }

    incrementError() {
        this.stats.errors++;
        this.emitChange();
    }

    incrementRedisQuery() {
        this.stats.redisQueries++;
        this.emitChange();
    }

    setLoadedCommandsCount(count: number) {
        this.stats.commands = count;
        this.emitChange();
    }

    setChannelCount(count: number) {
        this.stats.channels = count;
        this.emitChange();
    }

    setModuleStatus(module: keyof typeof this.stats.modules, status: ModuleStatus) {
        this.stats.modules[module] = status;
        this.emitChange();
    }

    private updateUptime() {
        const diff = Date.now() - this.startTime;
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)));
        const pad = (n: number) => n.toString().padStart(2, '0');
        this.stats.uptime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        
        this.emitChange();
    }

    private emitChange() {
        this.emit("change", { ...this.stats });
    }

    private async updateSystemStats() {

        const memUsage = process.memoryUsage();
        this.stats.memoryUsage = {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
        };

        const oneMinuteAgo = Date.now() - 60000;
        this.messagesLastMinute = this.messagesLastMinute.filter(t => t > oneMinuteAgo);
        this.stats.messagesPerSecond = Math.round((this.messagesLastMinute.length / 60) * 10) / 10;

        this.commandsLastMinute = this.commandsLastMinute.filter(t => t > oneMinuteAgo);
        this.stats.commandsPerMinute = this.commandsLastMinute.length;

        this.emitChange();
    }

    getStats() {
        return JSON.parse(JSON.stringify(this.stats));
    }
}

export const statsStore = new StatsStore();