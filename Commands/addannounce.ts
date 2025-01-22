import { activeTimers } from '@clients/PubSub'
import type { cmdData, Bot } from '../types';
import { query } from '@modules/Database';
import { Logger } from '@modules/Logger';

const addAnnounce = {
  name: 'addannounce',
  description: 'Add a new announcement',
  aliases: [],
  cooldown: 5000,
  permissions: ['admin'],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    const [text, timer] = commandData.message.args.slice(1);

    if (!text || !timer) {
      await client.CommandUtils.send(commandData.channel, 'Usage: !addannounce <text> <timer in minutes>');
      return;
    }

    try {
      const result = await query(
        'INSERT INTO "Anonnces" ("channelId", "text", "timer") VALUES ($1, $2, $3) RETURNING id',
        [commandData.channelId, text, parseInt(timer, 10)]
      );
      const announceId = result.rows[0].id;
      const interval = parseInt(timer, 10) * 60 * 1000;

      const timerId = setInterval(() => {
        client.CommandUtils.send(commandData.channel, text);
      }, interval);

      activeTimers.set(announceId.toString(), timerId);

      await client.CommandUtils.send(commandData.channel, 'Announcement added!');
    } catch (error) {
      Logger.error('Failed to add announcement:', error);
      await client.CommandUtils.send(commandData.channel, 'Failed to add announcement.');
    }
  },
};

export default addAnnounce;