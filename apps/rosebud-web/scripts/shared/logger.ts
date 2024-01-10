import pino from 'pino'

/**
 * Very low overhead Node.js utility logger https://github.com/pinojs/pino
 * Together with output formatter it is a sweet utility https://github.com/pinojs/pino-pretty
 *
 * logger.error('this is at error level')
 * logger.info('the answer is %d', 42)
 */
const logger = pino({
  level: 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    options: {
      levelFirst: true,
      colorize: true,
    },
    target: 'pino-pretty',
  },
})

export default logger
