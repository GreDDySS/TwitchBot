import { EventEmitter } from "events";

export interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
  id: number;
}

class LogStore extends EventEmitter {
    private logs: LogMessage[] = [];
    private readonly MAX_LOGS = 50;

    constructor() {
        super();
    }

    addLog(info: any) {
        const newLog: LogMessage = {
        timestamp: info.timestamp || new Date().toLocaleTimeString(),
        level: info.level || 'info',
        message: info.message || JSON.stringify(info),
        id: Date.now() + Math.random(),
        };
        this.logs.push(newLog);
        
        if (this.logs.length > this.MAX_LOGS) {
        this.logs.shift();
        }

        this.emit('change', [ ...this.logs]);
    }

    getLogs() {
        return [ ...this.logs];
    }
}

export const logStore = new LogStore();