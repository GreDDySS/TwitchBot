import { EventSource } from "eventsource";
import pc from "picocolors";
import { Logger } from "../Modules/Logger";
import { Channel } from "../Database/Channel";
import { bot } from "./Twitch";

const MAIN_URL = "https://events.7tv.io/v3@";
let source: EventSource | null = null;

const buffer = {
  pushed: [] as string[],
  pulled: [] as string[],
}

const createEventSource = async (): Promise<void> => {
  const channels = await Channel.getSevenTV();
  const url = `${MAIN_URL},emote_set.update<object_id=${channels
    .map((id) => id)
    .join(">,emote_set.update<object_id=")}>`;
  source = new EventSource(url);
};

const handleEvent = async (e: MessageEvent): Promise<void> => {
  try {
    const data = JSON.parse(e.data);
    const channels = await Channel.getSevenUsername(data.body.id);

    if (data.body.pushed) {
      buffer.pushed.push(data.body.pushed[0].value.name);
    }

    if (data.body.pulled) {
      buffer.pulled.push(data.body.pulled[0].old_value.name);
    }

    if (data.body.updated) {
      const oldName = data.body.updated[0].old_value.name;
      const newName = data.body.updated[0].value.name;
      bot.CommandUtils.sendCommand(
        channels[0],
        `/me [7TV] - Изменили эмоут ${oldName} на ${newName}`
      );
    }

    // Интервал для отправки сообщений с изменениями
    const INTERVAL = 10 * 1000;
    setTimeout(async () => {
      if (buffer.pulled.length > 0) {
        const emotesPulled = buffer.pulled.join(", ");
        bot.CommandUtils.sendCommand(
          channels[0],
          `/me [7TV] - Убрали эмоуты: ${emotesPulled}`
        );
        buffer.pulled = [];
      } else if (buffer.pushed.length > 0) {
        const emotesPushed = buffer.pushed.join(", ");
        console.log(channels[0]);
        bot.CommandUtils.sendCommand(
          channels[0],
          `/me [7TV] - Добавили эмоуты: ${emotesPushed}`
        );
        buffer.pushed = [];
      }
    }, INTERVAL);
  } catch (error) {
    Logger.error(`${pc.red("[STV ERROR]")} || Ошибка обработки события: ${(error as Error).message}`);
    bot.Utils.logError("STV ERROR", (error as Error).message, (error as Error).stack || "");
  }
};

const addListener = (): void => {
  if (source) {
    source.addEventListener("dispatch", handleEvent, false);
  }
};

export const initializeSTV = async (): Promise<void> => {
  Logger.info(`${pc.green("[STV]")} || Connect in SevenTV...`);
  if (source) {
    source.close();
    source = null;
  }

  try {
    await createEventSource();
    addListener();
    Logger.info(`${pc.green("[SevenTV]")} || Успешное подключение к SevenTV 🟢`);
  } catch (error) {
    Logger.error(
      `${pc.red("[SevenTV ERROR]")} || Ошибка подключения: ${
        (error as Error).message
      }`
    );
  }
};