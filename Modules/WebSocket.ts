import { WebSocketServer } from "ws";
import { Logger } from "./Logger";
import type { ClientMessage } from "../types";

const clients: Set<any> = new Set();

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  Logger.info(`New WebSocket client connected`);
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const parsed: ClientMessage = JSON.parse(message.toString());
            Logger.info(`Received event: ${parsed.event}`, parsed.data);
            
        } catch (error) {
            Logger.error(`Invalid WebSocket message: ${message}`);
        }
    });

    ws.on('close', () => {
        Logger.info(`WebSocket client disconnected`);
        clients.delete(ws);
    });
});

// Функция отправки данных всем клиентам
export const broadcast = (event: string, data: any) => {
    for (const client of clients) {
        client.send(JSON.stringify({ event, data }));
    }
};

export default wss;