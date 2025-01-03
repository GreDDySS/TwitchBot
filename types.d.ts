import type { IRCMessageTags } from "@kararty/dank-twitch-irc"
import {client} from "./Clients/Twitch"
interface Bot {
  Config?: botConfig;
  Twitch?: client;
  Commands?: command[];
  CommandUtils: commandUtils;

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

export type channelStats = {
  messages: number;
  commands: number;
}