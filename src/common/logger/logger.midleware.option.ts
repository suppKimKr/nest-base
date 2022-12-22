import * as winston from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';
import moment from 'moment';

export const winstonLoggerOptions = WinstonModule.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'http' : 'silly',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => moment().utc().add(9, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                }),
                winston.format.json(),
                winston.format.colorize(),
                utilities.format.nestLike('nest-base', {
                    prettyPrint: true,
                })
            ),
        }),
        new winston.transports.DailyRotateFile({
            level: 'info',
            filename: 'info.log',
            dirname: __dirname + '/../../logs/info/',
            maxFiles: '30d',
            datePattern: 'YYYY-MM-DD',
        }),
        new winston.transports.DailyRotateFile({
            level: 'error',
            filename: 'error.log',
            dirname: __dirname + '/../../logs/error/',
            maxFiles: '30d',
            datePattern: 'YYYY-MM-DD',
        }),
    ],
});
