import React from 'react';
import { render } from 'ink';
import App from './ui/App';
import config from './Config/config'
import { startTwitch } from './Clients/Twitch';

console.clear()

const { unmount } = render(<App config={config} />)

startTwitch().catch(err => {
    console.error("Fatal Error: ", err)
})

process.on("SIGINT", () => {
    //unmount();
    process.exit();
})