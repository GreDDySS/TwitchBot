import { readdir } from "fs/promises";
import path from "path";
import type { ICommand, CommandCtx, UserPermission } from "../Utils/types";
import { Logger } from "../Utils/Logger";
import { Sender } from "../Utils/Sender";
import { statsStore } from "../Utils/StatsStore";

function parseArgs(text: string): string[] {
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

    static async handleMessage(ctx: CommandCtx) {
        const prefix = "`"; //TODO: get DB

        if (!ctx.text.startsWith(prefix)) return;

        const args = parseArgs(ctx.text.slice(prefix.length))
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const cmdName = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(cmdName);

        if (!command) return;
        if (!this.checkPermission(ctx, command.permission)) return;

        const cooldownKey = `${command.name}-${ctx.user}`;
        if (this.cooldowns.has(cooldownKey)) return;

        try {
            await command.execute({
                ...ctx,
                args,
                send: (text) => Sender.send(ctx.channel, text),
                reply: (text) => Sender.reply(ctx.channel, text, ctx.msg.id)
            });

            if (command.cooldown) {
                this.cooldowns.add(cooldownKey);
                setTimeout(() => this.cooldowns.delete(cooldownKey), command.cooldown * 1000);
            }
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