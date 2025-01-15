import { activeTimers } from '@clients/PubSub'
import type { cmdData, Bot } from '../types';
import { query } from '@modules/Database';
import { Logger } from '@modules/Logger';

const removeAnnounce = {
  name: 'removeannounce',
  description: 'Remove an announcement',
  aliases: [],
  cooldown: 0,
  permissions: ['broadcaster'],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    const [announceId] = commandData.message.args.slice(1);

    if (!announceId) {
      await client.CommandUtils.send(commandData.channel, 'Usage: !removeannounce <announceId>');
      return;
    }

    try {
      await query('DELETE FROM "Anonnces" WHERE "id" = $1', [announceId]);

      const timerId = activeTimers.get(announceId);
      if (timerId) {
        clearInterval(timerId);
        activeTimers.delete(announceId);
      }

      await client.CommandUtils.send(commandData.channel, 'Announcement removed!');
    } catch (error) {
      Logger.error('Failed to remove announcement:', error);
      await client.CommandUtils.send(commandData.channel, 'Failed to remove announcement.');
    }
  },
};

export default removeAnnounce;