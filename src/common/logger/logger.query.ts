import { Logger, QueryRunner } from 'typeorm';
import { createLogger, Logger as WinstonLogger, transports, format } from 'winston';

export class LoggerQuery implements Logger {
    private readonly queryLogger: WinstonLogger;
    private readonly schemaLogger: WinstonLogger;
    private readonly customFormat: any;
    constructor() {
        this.customFormat = format.printf(({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`);
        const options = (filename: string) => ({
            transports: new transports.File({
                filename,
                level: 'debug',
            }),
            format: this.customFormat,
        });
        this.queryLogger = createLogger(options(__dirname + '/../../logs/query/query.log'));
        this.schemaLogger = createLogger(options(__dirname + '/../../logs/query/schema.log'));
    }
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.queryLogger.log({
            level: 'debug',
            message: `${query} - ${JSON.stringify(parameters)}`,
            timestamp: Date.now(),
            label: 'query',
        });
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.queryLogger.log({
            level: 'error',
            message: `${query} - ${JSON.stringify(parameters)}`,
            timestamp: Date.now(),
            label: 'query',
        });
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.queryLogger.log({
            level: 'warn',
            message: `${query} - ${JSON.stringify(parameters)}`,
            timestamp: Date.now(),
            label: 'query',
        });
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.schemaLogger.log({
            level: 'debug',
            message,
            timestamp: Date.now(),
            label: 'schema',
        });
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        this.schemaLogger.log({
            level: 'info',
            message,
            timestamp: Date.now(),
            label: 'schema',
        });
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
        this.queryLogger.log({
            level,
            message,
            timestamp: Date.now(),
            label: 'query',
        });
    }
}
