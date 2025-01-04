import type { IRCMessageTags } from "@kararty/dank-twitch-irc"
import {client} from "./Clients/Twitch"
interface Bot {
  Config?: botConfig;
  Twitch?: client;
  Commands?: command[];
  Temp: botTemp;
  CommandUtils: commandUtils;
  Utils: utils;

}
export type botConfig = {
  twitch: {
    token: string;
    bearer: string;
    clientID: string;
    secret: string;
    bot: string;
    channels: string[];
    preifx: string;
  };
  telegram: {
    token: string;
  };
  database: {
    host: string;
    name: string;
    port: number;
    user: string;
    password: string
  };
  commandsPath: string;
}

export type cmdData = {
  user: cmdDataUser,
  message: cmdDataMessage,
  type: string,
  command: string,
  channel: string,
  channelId: string,
  channelMeta?: any[],
  userState: IRCMessageTags,
}

type cmdDataUser = {
  id: string;
  name: string;
  login: string;
  color: string;
  badges: TwitchBadgesList;
};

type cmdDataMessage = {
  raw: string;
  text: string;
  args: string[];
};

type command = {
  name: string;
  aliases: string[];
  description?: string;
  cooldown: number;
  permissions: string[];
  active: boolean;
  execute: (context: cmdData, client: Bot) => Promise<void>;
}

type commandUtils = {
  send: (channel: string, message: string) => Promise<void>;
  sendError: (channel: string, message: string) => Promise<void>;
  sendCommand: (channel: string, message: string) => Promise<void>;
}

type botTemp = {
  cmdCount: number;
}

export type channelStats = {
  messages: number;
  commands: number;
}

type utils = {
  humanizeDuration: (time: number) => string;
  timeDelta: (time: number) => string;
  uptime: () => string;
  randomConnectEmote: () => string;
  random: (num: number) => number;
  randomArg: <T>(arg: T[]) => T;
  logError: (name: string, reason: string, stack: string) => Promise<void>;
  formatTimestamp: (timestamp: string | Date) => string;
  isJSON: (str: string) => boolean;
}
