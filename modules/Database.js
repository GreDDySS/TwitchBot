const pc = require("picocolors")
const { Client } = require("pg")

const db = new Client({
  host: bot.Config.db_host,
  user: bot.Config.db_user,
  port: bot.Config.db_port,
  password: bot.Config.db_pass,
  database: bot.Config.db_name
})

async function start() {
  try {
    await db.connect();
    bot.Logger.info(`${pc.green("[DATABASE]")} || DataBase connect successfully 🟢`);
  } catch (err) {
    bot.Logger.error(`${pc.red("[DATABASE]")} || Error connecting to database: ${err.message}`);
  }
}

module.exports = {db, start}