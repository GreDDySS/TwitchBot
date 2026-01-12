import winston from "winston";
import Transport from "winston-transport"
import { logStore } from "./LogStore";
import { statsStore } from "./StatsStore";
import { createErrorLog } from "../Database/ErrorLogs";
import { RuntimeConfig } from "../Config/RuntimeConfig";


class InkTransport extends Transport {
    override log(info: any, callback: () => void) {
        if (info.level === 'error') {
            statsStore.incrementError();
        }
        logStore.addLog(info);
        callback();
    }
}

class DatabaseErrorTransport extends Transport {
    override log(info: any, callback: () => void) {
        if (info.level === 'error') {
            const stack = info.stack || (info.metadata && info.metadata.stack);
            
            const moduleMatch = info.message.match(/^\[([^\]]+)\]\s*(.*)/);

            const name = moduleMatch ? moduleMatch[1] : "GreDDBot";
            const cleanMessage = moduleMatch ? moduleMatch[2] : info.message;
            
            if (!RuntimeConfig.disableDbWrites) {
                createErrorLog(
                    name,
                    cleanMessage,
                    stack
                );
            }
        }
        callback();
    }
}

export const Logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - [${level.toUpperCase()}] || ${message}`
        })
    ),
    transports: [
        new InkTransport(),
        new DatabaseErrorTransport()
    ]
})