import { query } from "@modules/Database";

export class Channel {
  static async getByID(userID: string) {
    const queryText = 'SELECT * FROM "Channels" WHERE "channelID" = $1';
    const values = [userID];
    const result = await query(queryText, values);
    return result.rows;
  }

  static async getByName(username: string) {
    const queryText = 'SELECT * FROM "Channels" WHERE "channelName" = $1';
    const values = [username];
    const result = await query(queryText, values);
    return result.rows;
  }

  static async getJoinable() {
    const queryText = 'SELECT "channelName" FROM "Channels" WHERE "ignore" = false';
    const result = await query(queryText);
    const res = result.rows.map((row) => {
      return row.channelName
    })
    return res;
  }

  static async getListenable() {
    const queryText = 'SELECT "channelName" FROM "Channels" WHERE "listenStreamStatus" = true';
    const result = await query(queryText);
    const res = result.rows.map((row) => {
      return row.channelName
    })
    return res;
  }

  static async getSevenTV() {
    const queryText = 'SELECT "sevenID" FROM "Channels" WHERE "sevenTV" = true';
    const result = await query(queryText);
    const res = result.rows.map((row) => {
      return row.sevenID
    })
    return res;
  }

  static async getSevenUsername(sevenID: string) {
    const queryText = 'SELECT "channelName" FROM "Channels" WHERE "sevenID" = $1';
    const values = [sevenID];
    const result = await query(queryText, values);
    const res = result.rows.map((row) => {
      return row.channelName
    })
    return res;
  }

  static async getChannelLogging() {
    const queryText = 'SELECT "channelID" FROM "Channels" WHERE "logging" = true';
    const result = await query(queryText);
    const res = result.rows.map((row) => {
      return row.channelID
    })
    return res;
  }

  static async getChannelPrefix(channelID: string) {
    const queryText = 'SELECT "prefix" FROM "Channels" WHERE channelID = $1';
    const values = [channelID];
    const result = await query(queryText, values);
    const res = result.rows.map((row) => {
      return row.prefix
    })
    return res;
  }
}