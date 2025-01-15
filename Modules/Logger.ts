import winston from 'winston'
import pc from 'picocolors'

const Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({format: 'DD.MM.YY HH:mm:ss'}),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `${pc.magenta(`${timestamp}`)} [${level}]: ${message}${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `${pc.magenta(`${timestamp}`)} [${level}]: ${message}`)
      )
    })
  ]
})

export { Logger }