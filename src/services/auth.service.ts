import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import HttpStatus from '../constants/status.constant';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../constants/env.constants';
import HttpError from '../errors/http.error';
import User from '../models/user.model';
import userRepository from '../repositories/user.repository';

type SanitizedUser = Omit<User, 'password'>;

type AuthResponse = {
    token: string;
    user: SanitizedUser;
};

type TokenPayload = {
    userId: number;
    email: string;
};

class AuthService {
    private readonly saltRounds = 12;
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;

    constructor() {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        this.jwtSecret = JWT_SECRET;
        this.jwtExpiresIn = JWT_EXPIRES_IN || '1h';
    }

    private sanitizeUser(user: User): SanitizedUser {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    private generateToken(user: User): string {
        const payload = {
            sub: user.id.toString(),
            email: user.email,
        };
        const options: SignOptions = {
            expiresIn: parseInt(this.jwtExpiresIn),
        };

        return jwt.sign(payload, this.jwtSecret, options);
    }

    public register = async (
        name: string,
        email: string,
        password: string
    ): Promise<AuthResponse> => {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new HttpError(HttpStatus.CONFLICT, 'User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        const userId = await userRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        const createdUser = await userRepository.findById(userId);
        if (!createdUser) {
            throw new HttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Failed to create user'
            );
        }

        const token = this.generateToken(createdUser);

        return {
            token,
            user: this.sanitizeUser(createdUser),
        };
    };

    public login = async (
        email: string,
        password: string
    ): Promise<AuthResponse> => {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new HttpError(
                HttpStatus.UNAUTHORIZED,
                'Invalid email or password'
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new HttpError(
                HttpStatus.UNAUTHORIZED,
                'Invalid email or password'
            );
        }

        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user),
        };
    };

    public verifyToken = (token: string): TokenPayload => {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
            const { sub, email } = decoded;

            if (typeof sub !== 'string' || typeof email !== 'string') {
                throw new HttpError(
                    HttpStatus.UNAUTHORIZED,
                    'Invalid token payload'
                );
            }

            const userId = parseInt(sub, 10);
            if (Number.isNaN(userId)) {
                throw new HttpError(
                    HttpStatus.UNAUTHORIZED,
                    'Invalid token payload'
                );
            }

            return {
                userId,
                email,
            };
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }

            throw new HttpError(
                HttpStatus.UNAUTHORIZED,
                'Invalid or expired token'
            );
        }
    };

    public getSanitizedUserById = async (
        id: number
    ): Promise<SanitizedUser> => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new HttpError(HttpStatus.NOT_FOUND, 'User not found');
        }

        return this.sanitizeUser(user);
    };
}

const authService = new AuthService();

export type { SanitizedUser, AuthResponse, TokenPayload };
export default authService;
