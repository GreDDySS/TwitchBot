import { EventEmitter } from "events";

export type ModuleStatus = 'online' | 'offline' | 'error' | 'loading';

class StatsStore extends EventEmitter {
    private startTime: number = Date.now();
    private uniqueUsers = new Set<string>();


    private stats = {
        messages: 0,
        commands: 0,
        commandsLoaded: 0,
        uptime: "00:00:00",
        channels: 0,
        dbQueries: 0,
        errors: 0,
        uniqueUsersCount: 0,
        modules: {
            Twitch: 'loading' as ModuleStatus,
            Database: 'loading' as ModuleStatus,
            SevenTV: 'offline' as ModuleStatus,
            Telegram: 'offline' as ModuleStatus,
            EventSub: 'offline' as ModuleStatus
        }
    };

    constructor() {
        super();
        setInterval(() => this.updateUptime(), 1000);
    }

    incrementMessage() {
        this.stats.messages++;
        this.emitChange();
    }

    incrementCommandUsage() {
        this.stats.commands++
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

    getStats() {
        return JSON.parse(JSON.stringify(this.stats));
    }
}

export const statsStore = new StatsStore();