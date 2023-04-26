const messageWrite = async (messageCount) => {
      const stats = await greddBot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
      const old_num = stats.rows.map((item) => {
            return item.messageLine
      })
      let result = messageCount + Number(old_num) 
      await greddBot.DB.db.query(`Update stats Set "messageLine" = ${result} Where "name" = 'globalStats'`)
}

const cmdUsed = async (cmdCount) => {
      const stats = await greddBot.DB.db.query(`Select * from stats where "name" = 'globalStats'`)
      const old_num = stats.rows.map((item) => {
            return item.cmdUsed
      })
      let result = cmdCount + Number(old_num)
      await greddBot.DB.db.query(`Update stats Set "cmdUsed" = ${result} Where "name" = 'globalStats'`)
}

module.exports = { messageWrite, cmdUsed }