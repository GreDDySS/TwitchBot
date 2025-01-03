import { query } from "../Modules/Database";

export class Stats {
  static async incrementMessageLine(channelID: string) {
    const queryText = `
      INSERT INTO Stats (id_channel, messageLine, cmdUsed)
      VALUES ($1, 1, 0)
      ON CONFLICT (id_channel) DO UPDATE
      SET messageLine = Stats.messageLine + 1
    `;
    const values = [channelID];
    await query(queryText, values);
  }

  static async incrementCmdUsed(channelID: string) {
    const queryText = `
      INSERT INTO Stats (id_channel, messageLine, cmdUsed)
      VALUES ($1, 0, 1)
      ON CONFLICT (id_channel) DO UPDATE
      SET cmdUsed = Stats.cmdUsed + 1
    `;
    const values = [channelID];
    await query(queryText, values);
  }

  static async getStats(channelID: string) {
    const queryText = 'SELECT * FROM Stats WHERE id_channel = $1';
    const values = [channelID];
    const result = await query(queryText, values);
    return result.rows[0];
  }
}