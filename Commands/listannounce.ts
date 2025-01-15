import type { cmdData, Bot } from '../types';
import { query } from '@modules/Database';
import { Logger } from '@modules/Logger';

const listAnnounce = {
  name: 'listannounce',
  description: 'List all announcements',
  aliases: ['listannounces'],
  cooldown: 5000,
  permissions: ['broadcaster'],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    try {
      const announcements = await query(
        'SELECT "id", "text" FROM "Anonnces" WHERE "channelId" = $1',
        [commandData.channelId]
      );

      if (announcements.rows.length === 0) {
        await client.CommandUtils.send(commandData.channel, 'No announcements found.');
        return;
      }

      const announcementList = announcements.rows
        .map((announce) => `ID: ${announce.id} | Text: ${announce.text}`)

      await client.CommandUtils.send(commandData.channel, `Announcements: ${announcementList}`);
    } catch (error) {
      Logger.error('Failed to list announcements:', error);
      await client.CommandUtils.send(commandData.channel, 'Failed to list announcements.');
    }
  },
};

export default listAnnounce;