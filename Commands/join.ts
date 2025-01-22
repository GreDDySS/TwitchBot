import type { cmdData, Bot } from '../types';
import { Logger } from '@modules/Logger';
import { getLoginInfo } from '@modules/APITwitch';
import { bot } from '@clients/Twitch';
import { query } from '@modules/Database'

const join = {
  name: 'join',
  description: 'Add the bot to your channel',
  aliases: [],
  cooldown: 0,
  permissions: ['broadcaster'],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    const channelName = commandData.message.args[1];; // Название канала, где вызвана команда

    try {
      // Получаем ID канала с помощью Twitch API
      const channelInfo = await getLoginInfo(channelName);
      if (!channelInfo.data || channelInfo.data.length === 0) {
        await client.CommandUtils.send(commandData.channel, 'Failed to fetch channel info.');
        return;
      }

      const channelId = channelInfo.data[0].id;

      // Добавляем бота на канал
      await bot.Twitch.join(channelName);

      // Сохраняем канал в базе данных
      await query(
        `INSERT INTO "Channels" ("channelID", "channelName") VALUES ($1, $2)
         ON CONFLICT ("channelID")`,
        [channelId, channelName]
      );

      await client.CommandUtils.send(commandData.channel, `Bot has been added to your channel: ${channelName}`);
    } catch (error) {
      Logger.error('Failed to add bot to channel:', error);
      await client.CommandUtils.send(commandData.channel, 'Failed to add bot to your channel.');
    }
  },
};

export default join;