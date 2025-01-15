import TwitchPS from 'twitchps'
import { Logger } from "@modules/Logger";
import pc from "picocolors";
import { config } from 'Config/config'
import { Channel } from '@database/Channel'
import { query } from '@modules/Database'
import { bot } from './Twitch'

export const activeTimers: Map<string, NodeJS.Timer> = new Map();

const pubsub = new TwitchPS({
  init_topics: [{topic: `video-playback.${config.twitch.bot}`}],
  reconect: true,
  debug: false
});

const subscribeToStreamEvents = async () => {
  const channels = await Channel.getListenable(); // Получаем каналы с listenStreamStatus = true
  channels.forEach((channelName) => {
    pubsub.addTopic({ topic: `video-playback.${channelName}`});

    pubsub.on(`video-playback.${channelName}`, (data) => {
      if (data.type === 'stream-up') {
        Logger.info(`${pc.green("[STREAM UP]")} || Stream started on channel ${channelName}`);
        startAnnouncements(channelName);
      } else if (data.type === 'stream-down') {
        Logger.info(`${pc.green("[STREAM DOWN]")} || Stream ended on channel ${channelName}`);
        stopAnnouncements(channelName);
      }
    });
  });
};

pubsub.on('connected', () => {
  Logger.info(`${pc.green("[PUBSUB]")} || Connected to Twitch PubSub 🟢`);
});

pubsub.on('error', (error: Error) => {
  Logger.error(`${pc.red("[PUBSUB ERROR]")} || ${error.message}`);
});

const startAnnouncements = async (channelName: string) => {
  const announcements = await query(
    'SELECT * FROM "Anonnces" WHERE "channelId" = (SELECT "channelId" FROM "Channels" WHERE "channelName" = $1)',
    [channelName]
  );

  announcements.rows.forEach((announce) => {
    const { id, text, timer } = announce;
    const interval = timer * 60 * 1000; // Переводим минуты в миллисекунды

    const timerId = setInterval(() => {
      bot.CommandUtils.send(channelName, text);
    }, interval);

    activeTimers.set(id.toString(), timerId);
  });
};

const stopAnnouncements = (channelName: string) => {
  activeTimers.forEach((timerId, announceId) => {
    clearInterval(timerId);
    activeTimers.delete(announceId);
  });
};

export { pubsub, subscribeToStreamEvents };