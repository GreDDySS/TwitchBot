import { Logger } from "../Modules/Logger"
import type { cmdData, Bot } from "../types"
import { Channel } from "../Database/Channel"

const ping = {
  name: 'ping',
  description: 'Check status bot',
  aliases: ['pung', 'pong', 'test'],
  cooldown: 5000,
  permissions: [],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    let dateNow = Date.now()
    await client.Twitch.ping();
    let dateAfterPing = Date.now()
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    const memory = Math.round(used * 100) / 100
    const channelCount = await Channel.getJoinable()
    try {
      await client.CommandUtils.send(commandData.channel, `@${commandData.user.name} PONG! 🟢 Ping: ${dateAfterPing - dateNow}ms • Channels: ${channelCount.length} · Uptime: ${client.Utils.uptime()} • Memory: ${memory}MB/512MBs • cmdUsed: ${client.Temp.cmdCount}`);
    } catch (error) {
      Logger.error(`Error executing command ${ping.name}: ${error}`);
    }
  },
}

export default ping;