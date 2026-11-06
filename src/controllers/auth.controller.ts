import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import HttpStatus from '../constants/status.constant';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user registration and authentication
 */
class AuthController {
    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *     responses:
     *       201:
     *         description: User registered successfully
     *       409:
     *         description: Email is already registered
     */
    /* prettier-ignore-end */
    public register = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { name, email, password } = req.body;
            const authResponse = await authService.register(
                name,
                email,
                password
            );

            res.status(HttpStatus.CREATED).json(authResponse);
        }
    );

    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/auth/login:
     *   post:
     *     summary: Authenticate a user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *     responses:
     *       200:
     *         description: Authentication successful
     *       401:
     *         description: Invalid email or password
     */
    /* prettier-ignore-end */
    public login = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { email, password } = req.body;
            const authResponse = await authService.login(email, password);

            res.status(HttpStatus.OK).json(authResponse);
        }
    );

    /* prettier-ignore-start */
    /**
     * @swagger
     * /api/v1/auth/profile:
     *   get:
     *     summary: Retrieve the authenticated user's profile
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Profile retrieved successfully
     *       401:
     *         description: Missing or invalid token
     */
    /* prettier-ignore-end */
    public profile = asyncHandler(
        async (req: AuthenticatedRequest, res: Response): Promise<void> => {
            if (!req.user) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Unauthorized',
                });
                return;
            }

            res.status(HttpStatus.OK).json({
                user: req.user,
            });
        }
    );
}

export default new AuthController();
