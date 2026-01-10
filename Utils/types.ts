import { ChatMessage } from "@twurple/chat";

export interface CommandCtx {
    channel: string;
    user: string;
    text: string;
    args: string[];
    msg: ChatMessage;

    send: (text: string) => Promise<void>
    reply: (text: string) => Promise<void>
}

export type UserPermission = "chatter" | "mod" | "broadcaster";

export interface ICommand {
    name: string;
    aliases?: string[];
    description?: string;
    permission?: UserPermission;
    cooldown?: number;
    execute: (ctx: CommandCtx) => Promise<void>;
}