import { chatClient } from "../Clients/Twitch";
import { Logger } from "./Logger";

export class Sender {
    /**
     * Send a secure message to the chat.
     * - Truncates to 500 characters.
     * - Catches errors (duplicates, spam filter).
     */
    static async send(channel: string, message: string) {
        await this.safeSay(channel, message);
    }

    static async reply(channel: string, message: string, replyToId: string) {
        await this.safeSay(channel, message, replyToId);
    }

    private static async safeSay(channel: string, message: string, replyToId?: string) {
        if (!message) return;
        const cleanMessage = message.slice(0, 495);

        try {
            await chatClient.say(channel, cleanMessage, { replyTo: replyToId });
        } catch (err: any) {
            const msg = err.message || "";
            if (msg.includes("msg_duplicate")) {
                Logger.warn(`[SEND] Duplicate rejected in ${channel}: "${cleanMessage}"`);
            } else if (msg.includes("msg_rejected")) {
                Logger.warn(`[SEND] AutoMod rejected in ${channel}: "${cleanMessage}"`);
            } else {
                Logger.error(`[SEND] Error in ${channel}: ${err}`);
            }
        }
    }
}