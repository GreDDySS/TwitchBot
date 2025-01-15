import type { cmdData, Bot } from '../types';
import { reloadCommand } from '@modules/LoadCommand';
import { Logger } from '@modules/Logger';

const reload = {
  name: 'reload',
  description: 'Reload a command',
  aliases: [],
  cooldown: 5000,
  permissions: ['admin'],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    const [commandName] = commandData.message.args.slice(1);

    if (!commandName) {
      await client.CommandUtils.send(commandData.channel, 'Usage: !reload <commandName>');
      return;
    }

    try {
      await reloadCommand(commandName);
      await client.CommandUtils.send(commandData.channel, `Command ${commandName} reloaded successfully!`);
    } catch (error) {
      Logger.error(`Failed to reload command ${commandName}:`, error);
      await client.CommandUtils.send(commandData.channel, `Failed to reload command ${commandName}.`);
    }
  },
};

export default reload;