import *  as  winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport: DailyRotateFile = new DailyRotateFile({
  filename: 'gateway-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '5m',
  maxFiles: '14d',
  dirname: process.env.LOG_DIR || 'logs',
});

const transports: winston.transport[] = [transport]
process.env.NODE_ENV?.includes('dev') && transports.push(new winston.transports.Console());

const defaultLogger = winston.createLogger({
  transports,
});

const logger = {
  info(msg: string) {
    defaultLogger.info(msg, { date: Date.now() });
  },
  error(msg: string) {
    defaultLogger.error(msg, { date: Date.now() });
  }
}

const stringifyError = (error: any) => {
  return JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
}

export { logger, stringifyError };