import type { ICommand } from "../Utils/types";

export default {
    name: "test",
    aliases: ["t"],
    description: "test",
    cooldown: 5,
    
    async execute({send, reply, user, text, args, msg}) {

        await send(`test`)
    }
} as ICommand