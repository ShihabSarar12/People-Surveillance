import { createLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {
    appLoggerConfig,
    devFormat,
    errorLoggerConfig,
    prodFormat,
} from '../configs/logger.config';
import { NODE_ENV } from '../constants/env.constants';

const isProd = NODE_ENV === 'production';

const logger = createLogger({
    level: 'info',
    format: isProd ? prodFormat : devFormat,
    transports: [
        new transports.Console(),

        ...(isProd
            ? [
                  new DailyRotateFile(appLoggerConfig),
                  new DailyRotateFile(errorLoggerConfig),
              ]
            : []),
    ],
});

export default logger;
