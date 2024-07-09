const getById = async (userId) => {
    const channelData = await bot.DB.public.query(`Select * from channel where "userId" = '${userId}'`)
    if(!channelData) {
        return undefined
    }
    return channelData.rows
}

const getByName = async (username) => {
    const channelData = await bot.DB.public.query(`Select * from channel where "name" = '${username}'`)
    if (!channelData) {
        return undefined
    }
    return channelData.rows
}

const getJoinable = async () => {
    const channels = await bot.DB.db.query(`Select * from public.channel where "ignore" = '0'`)
    const result = channels.rows.map((item) => {
        return item.name
    })
    return result
}

const getListenable = async () => {
    const channels = await bot.DB.public.query(`Select * from channel where "listenStreamStatus" = '0'`)
    const result = channels.rows.map((item) => {
        return item.userId
    })
    return result
}

const getSevenID = async () => {
    const channels = await bot.DB.public.query(`Select * from channel where "sevenTV" = '1'`)
    const result = channels.rows.map((item) => {
        return item.sevenID
    })
    return result
}

const getSevenUsername = async (id) => {
    const channels = await bot.DB.public.query(`Select * from channel where "sevenID" = '${id}'`)
    const result = channels.rows.map((item) => {
        return item.name
    })
    return result
}

module.exports = {getById, getByName, getJoinable, getListenable, getSevenID, getSevenUsername}