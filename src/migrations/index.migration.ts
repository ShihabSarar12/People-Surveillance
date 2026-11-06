import fs from 'fs';
import path from 'path';
import pool from '../configs/db.config';
import { Pool as PromisePool } from 'mysql2/promise';
import TableRow from '../types/tables.type';
import logger from '../utilities/logger.utility';

class Migration {
    private pool: PromisePool;

    constructor() {
        this.pool = pool;
    }

    public up = async (): Promise<void> => {
        let connection;
        try {
            const sqlFilePath: string = path.join(
                __dirname,
                'database',
                'migrate.up.sql'
            );
            const sql: string[] = fs
                .readFileSync(sqlFilePath, 'utf8')
                .split(';')
                .map((stmt) => stmt.trim())
                .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));
            connection = await this.pool.getConnection();
            await connection.beginTransaction();
            for (const statement of sql) {
                await connection.query(statement);
                await connection.commit();
            }
            logger.info('Migration up executed successfully');
            connection.release();
        } catch (error) {
            logger.error('Migration up failed:', error);
            await connection?.rollback();
            connection?.release();
        }
    };

    public down = async (): Promise<void> => {
        let connection;
        try {
            const sqlFilePath: string = path.join(
                __dirname,
                'database',
                'migrate.down.sql'
            );
            const sql: string[] = fs
                .readFileSync(sqlFilePath, 'utf8')
                .split(';')
                .map((stmt) => stmt.trim())
                .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));
            connection = await this.pool.getConnection();
            await connection.beginTransaction();
            for (const statement of sql) {
                await connection.query(statement);
                await connection.commit();
            }
            logger.info('Migration down executed successfully');
            connection.release();
        } catch (error) {
            logger.error('Migration down failed:', error);
            await connection?.rollback();
            connection?.release();
        }
    };

    public status = async (): Promise<void> => {
        try {
            const [rows] = await pool.query<TableRow[]>('SHOW TABLES');
            if (rows.length > 0) {
                console.log('Tables in the database:');
                console.log(rows.map((row) => Object.values(row)[0]));
            } else logger.error('Migration is not applied');
        } catch (error) {
            logger.error('Error checking migration status:', error);
        }
    };
}

export default new Migration();
