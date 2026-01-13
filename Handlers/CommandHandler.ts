import { readdir } from "fs/promises";
import path from "path";
import type { ICommand, CommandCtx, UserPermission } from "../Utils/types";
import { Logger } from "../Utils/Logger";
import { Sender } from "../Utils/Sender";
import { statsStore } from "../Utils/StatsStore";
import { ChannelService } from "../Services/ChannelService";
import config from "../Config/config"
import { redis } from "../Utils/Redis";

function parseArgs(text: string): string[] {
    if (text.length > 500) {
        Logger.warn(`[CMD] Command text too long: ${text.length} chars, truncating`);
        text = text.slice(0, 500);
    }

    const args: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of text){
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ' ' && !inQuotes){
            if (current) args.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (current) args.push(current);
    return args;
}

function validateArgs(args: string[]): boolean {
    for (const arg of args) {
        if (arg.length > 100) {
            Logger.warn(`[CMD] Argument too long: ${arg.length} chars`);
            return false;
        }

        if (arg.includes('\x00')) {
            Logger.warn(`[CMD] Argument contains null byte`);
            return false;
        }

        if (arg.includes('<') || arg.includes('>')) {
            Logger.warn(`[CMD] Argument contains HTML tags`);
            return false;
        }
    }
    return true;
}

export class CommandHandler {
    private static commands = new Map<string, ICommand>();
    private static aliases = new Map<string, string>();
    private static cooldowns = new Set<string>();

    static async loadCommands(commandsDir: string) {
        try {
            const files = await readdir(commandsDir);

            for (const file of files) {
                if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

                const module = await import(path.join(commandsDir, file));
                const command: ICommand = module.default || module.command;

                if (!command || !command.name) {
                    Logger.warn(`[CMD] Skipped invalid file: ${file}`);
                    continue;
                }

                this.commands.set(command.name.toLowerCase(), command);
                Logger.info(`[CMD] Loaded: ${command.name}`);

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
                    }
                }
            }

            statsStore.setLoadedCommandsCount(this.commands.size)
        } catch (err: any) {
            Logger.error(`[CMD] Error loading commands: ${err}`);
        }
    }

    private static async isOnCooldown(commandName: string, userId: string, cooldownSeconds: number): Promise<boolean> {
        const key = `cooldown:${commandName}:${userId}`;
        try {
            const exists = await redis.exists(key);
            if (exists) {
                return true;
            }

            await redis.setex(key, cooldownSeconds, 1);
            return false;
        } catch (err) {
            Logger.warn("[CMD] Redis error, using fallback for cooldown:", err);
            return false;
        }
    }

    static async handleMessage(ctx: CommandCtx) {
        const prefix = await ChannelService.getPrefix(ctx.msg.channelId!) || config.twitch.prefix;

        if (!ctx.text.startsWith(prefix)) return;

        const args = parseArgs(ctx.text.slice(prefix.length))
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        if (!validateArgs(args)) {
            Logger.warn(`[CMD] Invalid arguments from ${ctx.user} for command: ${commandName}`);
        }

        const cmdName = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(cmdName);

        if (!command) return;
        if (!this.checkPermission(ctx, command.permission)) return;

        const cooldownKey = `${command.name}-${ctx.user}`;
        if (command.cooldown && await this.isOnCooldown(command.name, ctx.user, command.cooldown)) {
            return;
        };

        try {
            await command.execute({
                ...ctx,
                args,
                send: (text) => Sender.send(ctx.channel, text),
                reply: (text) => Sender.reply(ctx.channel, text, ctx.msg.id)
            });

            statsStore.incrementCommandUsage();
            Logger.info(`[EXEC] ${ctx.user} user ${prefix}${command.name}`);
        } catch (err: any) {
            Logger.error(`[EXEC-FAIL] Command ${command.name} failed: ${err}`);
            await Sender.send(ctx.channel, `@${ctx.user}, failed FeelBadMan`);
        }
    }

    private static checkPermission(ctx: CommandCtx, required?: UserPermission): boolean {
        if (!required || required === "chatter") return true;
        
        const info = ctx.msg.userInfo;
        if (info.isBroadcaster) return true;
        if (required === "mod" && info.isMod) return true;
        if (required === "broadcaster" && !info.isBroadcaster) return false;
        
        return false;
    }
}