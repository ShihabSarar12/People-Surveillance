import path from 'path';
import { format } from 'winston';

const logFormat = format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const devFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
);

const prodFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
);

const appLoggerConfig = {
    filename: path.join('src', 'logs', 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
};

const errorLoggerConfig = {
    filename: path.join('src', 'logs', 'errors-%DATE%.log'),
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
};

export { devFormat, prodFormat, appLoggerConfig, errorLoggerConfig };
