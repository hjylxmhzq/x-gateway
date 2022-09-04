import *  as  winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport: DailyRotateFile = new DailyRotateFile({
  filename: 'gateway-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  dirname: 'logs',
});

const transports: winston.transport[] = [transport]
process.env.NODE_ENV?.includes('dev') && transports.push(new winston.transports.Console()); 

const logger = winston.createLogger({
  transports,
});

export { logger };