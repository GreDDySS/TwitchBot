import winston from "winston";
import Transport from "winston-transport"
import { logStore } from "./LogStore";


class InkTransport extends Transport {
   override log(info: any, callback: () => void) {
    logStore.addLog(info);
    callback();
  }
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message}) => {
        return `${timestamp} - [${level.toUpperCase()}] || ${message}`
    })
);

export const Logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [

        //TODO: Maybe log in files?
        
        new InkTransport(),
    ]
})