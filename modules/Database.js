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
    db.connect().then(() => {
        bot.Logger.info(`${pc.green("[DATABASE]")} || DataBase connect successfully 🟢`)})
        .catch((err) => {bot.Logger.error(`${pc.red("[DATABSE]")} || Error connecting to database`)})
}

module.exports = {db, start}