const pc = require("picocolors")
const { Client } = require("pg")

const db = new Client({
  host: greddBot.Config.db_host,
  user: greddBot.Config.db_user,
  port: greddBot.Config.db_port,
  password: greddBot.Config.db_pass,
  database: greddBot.Config.db_name
})
async function start() {
    db.connect().then(() => {greddBot.Logger.info(`${pc.green("[DATABASE]")} || DataBase connect successfully 🟢`)}).catch((err) => {greddBot.Logger.error(`${pc.red("[DATABSE]")} || Error connecting to database`)})
}

module.exports = {db, start}