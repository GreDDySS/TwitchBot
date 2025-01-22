import type { cmdData, Bot } from "types";
import fs from 'fs';
import path from 'path';
import { bot } from "@clients/Twitch";

const userList = `Artemu5 BJlaguK_ Eggrereal Fedotir GreDDySS GuyRalt Gvardovskiy Iamplugg Matria9 RandomCancer StreamElements SunsetColours_ Tuwka_ Xomachel ZULULpa borobushE crestavlennn eggUrt iLotterytea m4x0nn monkeoS rilaveon saopin lydeco_ HumanStudi0 Nipropieren avacuoss TheRennaisance neizyum`;

const celebration = {
  name: 'celebration',
  description: 'What a holiday today',
  aliases: ['праздник', 'prazdnik'],
  cooldown: 5000,
  permissions: [],
  active: true,
  execute: async (commandData: cmdData, client: Bot) => {
    try {
      const filePath = path.resolve(__dirname, '../data/celebration.json');
      const data = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

      const num = bot.Utils.random(data.length);
      const holiday = data[num - 1];

      console.log(commandData.message.args[1])
      // Обработка специального условия для пользователя "iamplugg"
      if (commandData.message.args[1] === 'тык' && commandData.channel === 'iamplugg') {
        await client.CommandUtils.send(
          commandData.channel,
          `${userList} Сегодняшний праздник: ${holiday}`
        );
        return;
      }

      // Обработка аргумента "info"
      if (commandData.message.args[1] === 'info') {
        await client.CommandUtils.send(
          commandData.channel,
          `Сегодняшний праздник: ${holiday} — ${num} из ${data.length}`
        );
        return;
      }

      // Стандартный вывод
      await client.CommandUtils.send(commandData.channel, `Сегодняшний праздник: ${holiday}`);
    } catch (error) {
      await client.CommandUtils.send(commandData.channel, 'Failed to fetch holiday information.');
    }
  },
};

export default celebration;
