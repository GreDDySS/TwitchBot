import { EventSource } from "eventsource";
import pc from "picocolors";
import { Logger } from '@modules/Logger';
import { Channel } from '@database/Channel';
import { bot } from '@clients/Twitch';
import { handleError } from "@utils/errorHandler"

const MAIN_URL = "https://events.7tv.io/v3@";
let source: EventSource | null = null;

const buffer: Record<string, { pushed: string[], pulled: string[]}> = {};

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

    if (!channels || channels.length === 0) return;

    const channelId = channels[0];

    if (!buffer[channelId]) {
      buffer[channelId] = { pushed: [], pulled: [] };
    }

    const channelBuffer = buffer[channelId];

    if (data.body.pushed) {
      channelBuffer.pushed.push(data.body.pushed[0].value.name);
    }

    if (data.body.pulled) {
      channelBuffer.pulled.push(data.body.pulled[0].old_value.name);
    }

    if (data.body.updated) {
      const oldName = data.body.updated[0].old_value.name;
      const newName = data.body.updated[0].value.name;
      bot.CommandUtils.sendCommand(
        channelId,
        `/me [7TV] - Изменили эмоут ${oldName} на ${newName}`
      );
    }

    // Интервал для отправки сообщений с изменениями
    const INTERVAL = 10 * 1000;
    setTimeout(async () => {
      if (channelBuffer.pulled.length > 0) {
        const emotesPulled = channelBuffer.pulled.join(", ");
        bot.CommandUtils.sendCommand(
          channelId,
          `/me [7TV] - Убрали эмоуты: ${emotesPulled}`
        );
        channelBuffer.pulled = [];
      } else if (channelBuffer.pushed.length > 0) {
        const emotesPushed = channelBuffer.pushed.join(", ");
        bot.CommandUtils.sendCommand(
          channelId,
          `/me [7TV] - Добавили эмоуты: ${emotesPushed}`
        );
        channelBuffer.pushed = [];
      }
    }, INTERVAL);
  } catch (error) {
    Logger.error(`${pc.red("[STV ERROR]")} || Error: ${(error as Error).message}`);
    handleError("[STV ERROR]", error);
  }
};

const addListener = (): void => {
  if (source) {
    source.addEventListener("dispatch", handleEvent, false);
  }
};

export const initializeSTV = async (): Promise<void> => {
  if (source) {
    source.close();
    source = null;
  }

  try {
    await createEventSource();
    addListener();
  } catch (error) {
    Logger.error(`${pc.red("[STV ERROR]")} || Error: ${(error as Error).message}`);
    handleError("[STV ERROR]", error);
  }
};