import { SayError } from "@kararty/dank-twitch-irc";
import pc from "picocolors";
import { bot, client } from "@clients/Twitch";
import { Logger } from "./Logger";
import { handleError } from "@utils/errorHandler"
const LENGTH_LIMIT = 400;

/**
 * Send a message to a channel, if the message is too long it will be truncated
 * @param channel Channel name
 * @param message Message
 */
export const send = async (channel: string, message: string): Promise<void> => {
  try {
    let truncatedMessage = message;
    if (message.length > LENGTH_LIMIT) {
      truncatedMessage = `${message.substring(0, LENGTH_LIMIT - 1)}...`;
    }

    await client.say(channel, truncatedMessage);
  } catch (error) {
    if (error instanceof SayError) {
      if (error.message.includes("@msg-id=msg_rejected")) {
        await client.say(channel, "That message violates the channel automod settings.");
      } else if (error.message.includes("@msg-id=msg_duplicate")) {
        await client.say(channel, "That message was a duplicate FeelsDankMan");
      } else {
        await client.say(channel, "Error while processing the reply message monkaS");
      }
      handleError("[MESSAGE ERROR]", error);
    } else {
      handleError("[UNEXPECTED ERROR]", error);
    }
  }
};

/**
 * Send an error message to a channel
 * @param channel Channel name
 * @param message Message
 */
export const sendError = async (channel: string, message: string): Promise<void> => {
  client.sendRaw(`PRIVMSG ${channel} :/me ${message}`);
};

/**
 * Send a command to a channel
 * @param channel Channel name
 * @param message Message
 */
export const sendCommand = async (channel: string, message: string): Promise<void> => {
  try {
    await client.privmsg(channel, message);
  } catch (error) {
    handleError("[COMMAND ERROR]", error);
  }
};