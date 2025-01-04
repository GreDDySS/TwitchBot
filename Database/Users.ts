import { query } from "../Modules/Database";
import { Logger } from "../Modules/Logger";
import pc from "picocolors";
import type { cmdData } from "../types"
import { bot } from "../Clients/Twitch"

export class Users {
  /**
   * 
   * @param userID ID chatter  
   * @returns True if user exists, false if not
   */
  static async userExists(userID: string): Promise<boolean> {
    try {
      const result = await query(`SELECT 1 FROM "Users" WHERE "userID" = $1`, [userID]);
      return result.rows.length > 0;
    } catch (e) {
      Logger.error(`${pc.red("[USERS ERROR]")} || Failed finding user: ${e}`);
      throw e;
    }
  }

  static async addOrUpdateUser(commandData: cmdData): Promise<void> {
    // useriD, username, displayName, color

    try {
      const exists = await this.userExists(commandData.user.id);

      if (exists) {
        await query(
          `UPDATE "Users"
          SET "username" = $1, "displayName" = $2, "color" = $3
          WHERE "userID" = $4`,
          [commandData.user.login, commandData.user.name, commandData.user.color, commandData.user.id])
          // Logger.info(`${pc.green("[USERS]")} || User ${commandData.user.name} updated`);
      } else {
        await query(
          `INSERT INTO "Users" ("userID", "username", "displayName", "color")
          VALUES ($1, $2, $3, $4)`,
          [commandData.user.id, commandData.user.login, commandData.user.name, commandData.user.color])
          // Logger.info(`${pc.green("[USERS]")} || User ${commandData.user.name} added`);
      }
    } catch (e) {
      Logger.error(`${pc.red("[USERS ERROR]")} || Failed adding/updating user: ${e}`);
      bot.Utils.logError("USERS ERROR", (e as Error).message, (e as Error).stack || "");
      throw e;
    }
  }
}


