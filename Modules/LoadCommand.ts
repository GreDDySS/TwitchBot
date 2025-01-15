import { readdirSync } from "fs";
import path from "path";
import type { command } from "../types";
import { Logger } from "./Logger";
import pc from "picocolors";
import { config } from "Config/config"

const commands: Map<string, command> = new Map();
const aliases: Map<string, string> = new Map();

/**
 * Load all commands from the commands folder and register them
 * @param commandsPath Path to the commands folder
 */
export const loadCommands = async (commandsPath: string): Promise<void> => {
  const files = readdirSync(commandsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  if (files.length <= 0) {
    Logger.warn(`${pc.yellow("[COMMANDS]")} || No commands found`);
    return;
  }

  files.forEach((file) => {
    try {
      const filepath = path.join(commandsPath, file);
      const command: command = require(filepath).default;

      if (!command.name) {
        throw new Error(`Command ${file} does not have a name`);
      }

      commands.set(command.name, command);
      command.aliases.forEach((alias) => aliases.set(alias, command.name));

      // Logger.info(`${pc.green("[COMMAND]")} || Command ${command.name} loaded`);
    } catch (e) {
      Logger.error(`${pc.red("[COMMAND ERROR]")} || Failed loading command ${file}: ${e}`);
    }
  });
};

export const getCommand = (name: string): command | undefined => {
  const commandName = aliases.get(name) || name;
  return commands.get(commandName);
};

export const reloadCommand = async (commandName: string): Promise<void> => {
  const filepath = path.join(config.commandsPath, `${commandName}.ts`);

  delete require.cache[require.resolve(filepath)];

  const command = require(filepath).default;

  if (!command.name) {
    throw new Error(`Command ${commandName} does not have a name`);
  }

  commands.set(command.name, command);
  command.aliases.forEach((alias: string) => aliases.set(alias, command.name));

  Logger.info(`${pc.green("[COMMAND]")} || Command ${command.name} reloaded`);
}