import dotenv from 'dotenv';
import mysql, { Pool as PromisePool } from 'mysql2/promise';
import logger from '../utilities/logger.utility';
import {
    MYSQL_DB,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USER,
    NODE_ENV,
} from '../constants/env.constants';

dotenv.config();
const pool: PromisePool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

if (NODE_ENV !== 'test') {
    (async () => {
        const connection = await pool.getConnection();
        logger.info('Database connected successfully');
        connection.release();
    })().catch((err: any) => {
        console.error(
            `Database connection failed: ${err.name}: ${err.message}\n${err.stack}`
        );
        process.exit(0);
    });
}

export default pool;
