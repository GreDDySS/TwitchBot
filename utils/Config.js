require("dotenv").config();
module.exports = {
    username: process.env.BOT,
    password: process.env.PASSWORD,
    bearer: process.env.BEARER,
    clientId: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    token: process.env.TOKEN,
    prefix: process.env.PREFIX,
    owner: process.env.OWNER,
    botId: process.env.BOTID,
    tgToken: process.env.TG_TOKEN,
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    db_pass: process.env.DB_PASS,
    db_port: process.env.DB_PORT,
    db_user: process.env.DB_USER,
};