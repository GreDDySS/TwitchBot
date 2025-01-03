const cooldowns: Map<string, Map<string, number>> = new Map();

/**
 *  Checlk if user is on cooldown for a command.
 * @param channel  Channel, where command was used
 * @param userID  User ID of the chatter
 * @param commandName Name of the command
 * @param cooldown Cooldown time in milliseconds
 * @returns `true` if user is on cooldown, `false` if not
 */
export const checkCooldown = (channel: string, userID: string, commandName: string, cooldown: number): boolean => {
  const channelCooldowns = cooldowns.get(channel) || new Map();
  const key = `${userID}-${commandName}`;
  const now = Date.now();

  if (channelCooldowns.has(key) && now < channelCooldowns.get(key)!) {
    return true; // on cooldown
  }
  // set cooldown
  channelCooldowns.set(key, now + cooldown);
  cooldowns.set(channel, channelCooldowns);
  return false; // not on cooldown
};

/**
 * Reset cooldown for a user
 * @param channel Channel, where command was used
 * @param userID USer ID of the chatter
 * @param commandName Name of the command
 */
export const resetCooldown = (channel: string, userID: string, commandName: number): void => {
  const channelCooldowns = cooldowns.get(channel);
  if (channelCooldowns) {
    channelCooldowns.delete(`${userID}-${commandName}`);
  }
}