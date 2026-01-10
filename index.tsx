import React from 'react';
import { render } from 'ink';
import App from './ui/App';
import config from './Config/config'
import { startTwitch } from './Clients/Twitch';
import meow from "meow"

const cli = meow(`
    Usage
      $ bun run index.tsx

    Options
      --no-ui   Disable TUI (useful for Docker Logs)
      --help    Show this help
    
    Examples
      $ bun run index.tsx --no-ui
    `, {
        importMeta: import.meta,
        flags: {
            ui: {
                type: 'boolean',
                default: true
            },
        }
    }
);

async function main() {
    console.clear()
    
    if (cli.flags.ui){
        const { unmount } = render(<App config={config} />);
        
        
        process.on("SIGINT", () => {
            unmount();
            process.exit(0);
        })
    } else {
        console.log("Starting in Headles Mode (No UI)...");
    }
    
    startTwitch().catch(err => {
        console.error("Fatal Error: ", err)
        process.exit(1);
    })
}

main();