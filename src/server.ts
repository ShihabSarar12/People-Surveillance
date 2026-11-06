import 'reflect-metadata';
import app from './app';
import migration from './migrations/index.migration';
import logger from './utilities/logger.utility';
import initializeCrons from './crons/index.cron';
import { PORT } from './constants/env.constants';

const port: number = parseInt(PORT || '3000');

app.listen(port, '0.0.0.0', async () => {
    initializeCrons();
    console.log('-----------------------------------');
    await migration.up();
    await migration.status();
    logger.info(`Server started on port ${port}: http://localhost:${port}`);
    logger.info(
        `API Documentation available at http://localhost:${port}/api-docs`
    );
    console.log('-----------------------------------');
});
