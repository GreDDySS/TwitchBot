import { AlternateMessageModifier, SlowModeRateLimiter, ChatClient, LoginError, JoinError, SayError, PrivmsgMessage} from '@kararty/dank-twitch-irc';
import pc from "picocolors";
import { query } from '../Modules/Database';
import { Logger } from '../Modules/Logger';
import { Channel } from '../Database/Channel';
import { config } from '../Config/config';
import type { cmdData, Bot } from '../types'
import { Users } from '../Database/Users'
import { getCommand, loadCommands } from '../Modules/LoadCommand'
import { checkCooldown } from '../utils/Cooldown'
import {send, sendError, sendCommand} from "../Modules/Command"
import { Stats } from '../Database/Stats';

const client = new ChatClient({
  username: config.twitch.bot,
  password: config.twitch.token,
  rateLimits: "default"
});

client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 10));

const bot: Bot = {
  Config: config,
  Twitch: client,
  CommandUtils: {
    send,
    sendError,
    sendCommand
  }
};

async function initalize() {
  try {
    loadCommands(config.commandsPath);
    const channels = await Channel.getJoinable();
    await client.joinAll(channels);
    await client.connect();
    Logger.info(`${pc.green("[INIT]")} Twitch client initialize successfully`);
    await client.say("greddyss", "V2 modCheck");
  } catch (error) {
    Logger.error(`${pc.red("[INIT ERROR]")} || Failed to initialize Twitch client: ${error}`);
    throw error;
  }
}

client.on("error", (error) => {
  if (error instanceof LoginError) {
    return Logger.warn(`${pc.red("[LOGIN]")} || Error logging in to TWITCH: ${error}`);
  } else if (error instanceof JoinError) {
    return Logger.warn(`${pc.red("[JOIN]")} || Error joning channel: ${error.failedChannelName} : ${error}`);
  } else if(error instanceof SayError) {
    return Logger.warn(`${pc.red("[SAY]")} || Error sending message in: ${error.failedChannelName} : ${error}`);
  } else {
    Logger.error(`${pc.red("[ERROR]")} || Error occured in DIT: ${error}`);
  }
});

client.on("CLEARCHAT", async (msg) => {
  if (msg.isTimeout()) {
    Logger.warn(`${pc.yellow("[TIMEOUT]")} ${msg.targetUsername} got timed out in ${msg.channelName} for ${msg.banDuration} seconds`);
  } else if (msg.isPermaban() && !msg.banDuration) {
    Logger.warn(`${pc.yellow("[BAN]")} ${msg.targetUsername} got banned in ${msg.channelName}`)
    if (msg.targetUsername == config.twitch.bot) {
      query(`UPDATE channels SET "ingore" = true WHERE "username" = '${msg.channelName}'`)
    }
  } else if (msg.wasChatCleared()) {
    Logger.warn(`${pc.yellow("[CLEARCHAT]")} Chat was cleared in ${msg.channelName}`);
  }
})

client.on("PRIVMSG", async (msg) => {
  if (msg.senderUsername !== config.twitch.bot) {
    await handleUserMessage(msg);
  };

  await Stats.incrementMessage(msg.channelID);

  // check permissions bot in chat (chatter, mod, broadcaster)
  if (msg.senderUsername == config.twitch.bot) {
    const botbadges = msg.badges || {};
    let botRole = "chatter";
  
    if (botbadges.hasBroadcaster) {
      botRole = "broadcaster";
    } else if (botbadges.hasModerator) {
      botRole = "moderator";
    } else if (botbadges.hasVIP) {
      botRole = "vip";
    };
    // update bot role in channel table
    await query(`UPDATE "Channels" SET "mode" = $1 WHERE "channelName" = $2`, [botRole, msg.channelName]);
    // Logger.info(`${pc.cyan("[ROLE]")} Bot role in ${msg.channelName}: ${botRole}`);
  }
})

const handleUserMessage = async (msg: PrivmsgMessage) => {
  const message = msg.messageText;
  const args = message.split(/\s+/g);
  const command = args[0]
  const prefix: string | any = config.twitch.preifx || await Channel.getChannelPrefix(msg.channelID);
  const commandString = command.slice(prefix.length);
  const type = message.startsWith(prefix) ? 'command' : 'message';
  const channelMeta = await Channel.getByName(msg.channelName);

  if (type === 'command' && !commandString) {
    Logger.warn(`${pc.yellow("[COMMAND]")} || Empty command received from ${msg.senderUsername} in ${msg.channelName}`);
    return;
  }

  const commandData: cmdData = {
    user: {
      id: msg.senderUserID,
      name: msg.displayName,
      login: msg.senderUsername,
      color: msg.colorRaw,
      badges: msg.badgesRaw,
    },
    message: {
      raw: msg.rawSource,
      text: message,
      args: args,
    },
    type: type,
    command: command,
    channel: msg.channelName,
    channelId: msg.channelID,
    channelMeta: channelMeta,
    userState: msg.ircTags,
  };

  await Users.addOrUpdateUser(commandData);
  
  const getUserPermissions = (commandData: cmdData) => {
    const userState = commandData.userState;
    const permissions: string[] = [];

    if (userState["mod"]) permissions.push("mod");
    if (userState["broadcast"]) permissions.push("broadcaster");
    if (userState["vip"]) permissions.push("vip");
    if (!permissions.includes("mod") && !permissions.includes("broadcaster") && !permissions.includes("vip")) permissions.push("chatter");

    return permissions;
  }

  if (type !== 'command') return;


  const cmd = getCommand(commandString);
  if (!cmd) return;
  if (!cmd.active) return;

  if (cmd.permissions.length > 0) {
    const userPermissions = getUserPermissions(commandData);
    const hasPermission = cmd.permissions.some((permission: string) => userPermissions.includes(permission));
    if (!hasPermission) {
      Logger.warn(`${pc.yellow("[PERMISSIONS]")} || ${commandData.user.name} doesn't have permission to run ${cmd.name}`);
      return;
    }
  }
  
  if (checkCooldown(commandData.channel, commandData.user.id, cmd.name, cmd.cooldown)) return;

  try {
    await cmd.execute(commandData, bot);
    await Stats.incrementCommand(msg.channelID);
  } catch (error) {
    Logger.error(`${pc.red("[COMMAND ERROR]")} || Error executing command ${cmd.name}: ${error}`);
  }
  


}

export {initalize, client}