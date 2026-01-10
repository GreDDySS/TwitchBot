import { RefreshingAuthProvider, exchangeCode } from "@twurple/auth";
import { promises as fs } from "fs";
import path from "path";
import config from "../Config/config";
import { Logger } from "../Utils/Logger";

const DATA_DIR = path.join(process.cwd(), "Data")
const TOKEN_FILE = path.join(DATA_DIR, "tokens.json")

interface StoredToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    obtainmentTimestamp: number;
    scope?: string[];
}

async function ensureDir() {
    await fs.mkdir(DATA_DIR, {recursive: true});
}

async function loadTokens(): Promise<StoredToken | null> {
    try {
        const data = await fs.readFile(TOKEN_FILE, "utf-8");
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

async function saveTokens(tokenData: StoredToken) {
    await ensureDir();
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
}

export const authProvider = new RefreshingAuthProvider({
    clientId: config.twitch.clientId,
    clientSecret: config.twitch.clientSecret,
});

authProvider.onRefreshFailure(async (userId, error) => {
    Logger.crit(`[AUTH] Refresh token invalid for ${userId}! Error: ${error.message}`)
});

authProvider.onRefresh(async (userId, newTokenData) => {
    try {
        await saveTokens(newTokenData as StoredToken)
        Logger.info(`[AUTH] Tokens refreshed and saved for user ${userId}`);
    } catch (err) {
        Logger.error("[AUTH] Failed to save refreshed tokens: ", err);
    }
});



export async function iniitializeAuth() {
    await ensureDir();

    const stored = await loadTokens();

    if (stored) {
        try {
            authProvider.addUser(config.twitch.botId, stored, ["chat"]);
            Logger.info("[AUTH] ✅ Tokens loaded from file.");
            return;
        } catch (err) {
            Logger.warn("[AUTH] Failed to add user from stored tokens, will re-auntificate ", err);
        }
    }

    Logger.warn("[AUTH] ⚠️ No valid tokens found => Starting authorization flow...");

    const requiredScopes = [
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
    ].join(" ");

    const redirectUri = "http://localhost:3000/auth";
    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${config.twitch.clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(requiredScopes)}`;

    console.log(`\nCreated Authorization URL: ${authUrl}`);

    const server = Bun.serve({
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);

            if(url.pathname !== "/auth"){
                return new Response("404 Not Found", { status: 404 });
            }

            const code = url.searchParams.get("code");
            if (!code) {
                return new Response("No code provided", { status: 400 });
            }

            try {
                const tokenData = await exchangeCode(
                    config.twitch.clientId,
                    config.twitch.clientSecret,
                    code,
                    redirectUri
                );

                authProvider.addUser(config.twitch.botId, tokenData, ["chat"]);

                await saveTokens(tokenData as StoredToken);

                Logger.info("[AUTH] ✅ Authorization completed, tokens saved");

                setTimeout(() => server.stop(), 1500);

                return new Response(
                    "Success! You can close this tab and check the console.",
                    { status: 200 }
                );
            
            } catch (err: any) {
                Logger.error("[AUTH] ❌ Error exchaging code: ", err);
                return new Response(`Error: ${err.message}`, {status: 500});
            }
        }
    })

    await new Promise<void>((resolve) => {
        const interval = setInterval(async () => {
            if (authProvider.hasUser(config.twitch.botId)){
                clearInterval(interval);
                resolve()
            }
        }, 8000)
    })

    Logger.info("[AUTH] System ready.")
}