import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import { promises as fs } from "fs";
import path from "path";
import config from "../Config/config";
import { Logger } from "../Utils/Logger";

const DATA_DIR = path.join(process.cwd(), "Data")
const TOKEN_FILE = path.join(DATA_DIR, "tokens.json")

async function loadTokens() {
    try {
        const data = await fs.readFile(TOKEN_FILE, "utf-8");
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

async function saveTokens(data: any) {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true })
    }

    await fs.writeFile(TOKEN_FILE, JSON.stringify(data, null, 4), "utf-8")
}

export const authProvider = new RefreshingAuthProvider({
    clientId: config.twitch.clientId,
    clientSecret: config.twitch.clientSecret
})

authProvider.onRefresh(async (userId, newTokenData) => {
    await saveTokens(newTokenData);
    // console.log("[AUTH] 🔄️ Tokens refreshed automatically.")
    Logger.info("[AUTH] 🔄️ Tokens refreshed automatically.")
})

export async function iniitializeAuth() {
    const existingTokens = await loadTokens();

    if (existingTokens) {
        // console.log("[AUTH] ✅ Tokens loaded from file.");
        Logger.info("[AUTH] ✅ Tokens loaded from file.")
        authProvider.addUser(config.twitch.botId, existingTokens, ["chat"]);
        return;
    }

    // console.log("[AUTH] ⚠️ No tokens found. Starting local server...");
    Logger.warn("[AUTH] ⚠️ No tokens found. Starting local server...");

    const server = Bun.serve({
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);
            const code = url.searchParams.get("code");

            if (code) {
                try {
                    const tokenData = await exchangeCode(
                        config.twitch.clientId,
                        config.twitch.clientSecret,
                        code,
                        "http://localhost:3000/auth"
                    );

                    // console.log("[AUTH] 🔑 Code received! Exchanged for tokens.");
                    Logger.info("[AUTH] 🔑 Code received! Exchanged for tokens.");

                    authProvider.addUser(config.twitch.botId, tokenData, ["chat:read", "chat:edit"]);

                    await saveTokens(tokenData);

                    setTimeout(() => server.stop(), 1000);

                    return new Response("Success! You can close this tab and check the console.")
                
                } catch (e: any) {
                    // console.error("[AUTH] ❌ Error exchaging code: ", e);
                    Logger.error("[AUTH] ❌ Error exchaging code: ", e);
                    return new Response(`Error: ${e.message}`, {status: 500});
                }
            }

            return new Response(`${config.twitch.botUsername} OAuth Server. Waiting for code...`);
        }
    })

    const scopes = [
        "chat:read",
        "chat:edit",
        "channel:bot",
        "channel:manage:broadcast",
        "channel:manage:redemptions",
        "channel:manage:polls",
        "channel:manage:predictions",
        "moderator:manage:banned_users",
        "moderator:manage:chat_messages",
        "moderator:manage:chat_settings",
        "moderator:manage:announcements",
        "channel:read:subscriptions",
        "moderator:read:chatters",
    ];
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.clientId}&redirect_uri=http://localhost:3000/auth&response_type=code&scope=${scopes.join("+")}`;

    console.log(`\nCreated Authorization URL: ${authUrl}`);

    await new Promise<void>((resolve) => {
        const checkInterval = setInterval(async () => {
            if (authProvider.hasUser(config.twitch.botId)){
                clearInterval();
                resolve()
            }
        }, 1000)
    })

    // console.log("[AUTH] System ready.")
    Logger.info("[AUTH] System ready.")
}