import React from 'react';
import { render } from 'ink';
import App from './ui/App';
import config from './Config/config'
import { RuntimeConfig } from './Config/RuntimeConfig';
import { startTwitch, chatClient } from './Clients/Twitch';
import meow from "meow"
import { sleep } from 'bun';
import { prisma } from './Database';
import { statsStore } from './Utils/StatsStore';
import { Logger } from './Utils/Logger';

let unmountFn: (() => void) | null = null;
let isShuttingDown = false;

const cli = meow(`
    Usage
      $ bun run index.tsx

    Options
      --no-ui           Disable TUI (useful for Docker Logs)
      --help            Show this help
      --disableDbWrites    Disable all Database writes (Logs, Users, Error)
    
    Examples
      $ bun run index.tsx --no-ui
    `, {
    importMeta: import.meta,
    flags: {
        ui: {
            type: 'boolean',
            default: true
        },
        disableDbWrites: {
            type: 'boolean',
            default: false,
            
        }
    }
}
);

async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    Logger.info(`[SHUTDOWN] Received ${signal}, shutting down gracefully...`);
    
    try {
        if (cli.flags.ui && unmountFn) {
            unmountFn();
        }
        if (chatClient.isConnected) {
            await chatClient.quit();
        }

        statsStore.destroy();
        await prisma.$disconnect();

        Logger.info("[SHUTDOWN] Graceful shutdown completed");
        process.exit(0);
    } catch (err) {
        Logger.error("[SHUTDOWN] Error during shutdown:", err);
        process.exit(1);
    }
}

async function main() {
    RuntimeConfig.disableDbWrites = cli.flags.disableDbWrites;
    if (RuntimeConfig.disableDbWrites) {
        console.warn("\n[WARNING] 🛑 DATABASE WRITES ARE DISABLED! \n");
        await sleep(3000);
    }
    
    console.clear()

    if (cli.flags.ui) {
        const { unmount } = render(<App config={config} />);
        unmountFn = unmount;
    } else {
        console.log("Starting in Headless Mode (No UI)...");
    }

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("unhandledRejection", (reason, promise) => {
        Logger.error("[FATAL] Unhandled Rejection:", reason);
        gracefulShutdown("unhandledRejection");
    });

    process.on("uncaughtException", (error) => {
        Logger.error("[FATAL] Uncaught Exception:", error);
        gracefulShutdown("uncaughtException");
    });

    startTwitch().catch(err => {
        Logger.error("Fatal Error: ", err);
        gracefulShutdown("startupError");
    });
}

main();