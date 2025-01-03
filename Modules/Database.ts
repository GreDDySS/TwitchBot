import { Pool } from 'pg'
import { Logger } from './Logger'
import { config } from '../Config/config'

const pool = new Pool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: config.database.name
})

pool.on('connect', () => Logger.info('Database successfully connect!'))
pool.on('error', (err) => Logger.error('Database error:', err.stack || err))

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } catch (err) {
    Logger.error(`Error sending query in DB:`, err)
    throw err;
  } finally {
    client.release()
  }
}