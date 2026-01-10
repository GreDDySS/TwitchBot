import type { ICommand } from "../Utils/types";

export default {
    name: "ping",
    aliases: ["p"],
    description: "Check latency bot",
    cooldown: 5,
    
    async execute({send, reply, user, text, args, msg}) {
        await send(`@${user}, PONG!`)
    }
} as ICommand