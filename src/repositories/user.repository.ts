import { ResultSetHeader } from 'mysql2';
import { Pool as PromisePool } from 'mysql2/promise';
import pool from '../configs/db.config';
import User from '../models/user.model';

type CreateUserParams = {
    name: string;
    email: string;
    password: string;
};

class UserRepository {
    private pool: PromisePool;

    constructor() {
        this.pool = pool;
    }

    public async findByEmail(email: string): Promise<User | null> {
        const [rows] = await this.pool.query<User[]>(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );
        return rows.length ? rows[0] : null;
    }

    public async findById(id: number): Promise<User | null> {
        const [rows] = await this.pool.query<User[]>(
            `SELECT * FROM users WHERE id = ? LIMIT 1`,
            [id]
        );
        return rows.length ? rows[0] : null;
    }

    public async create(data: CreateUserParams): Promise<number> {
        const { name, email, password } = data;
        const [result] = await this.pool.execute<ResultSetHeader>(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, password]
        );
        return result.insertId;
    }
}

export default new UserRepository();
