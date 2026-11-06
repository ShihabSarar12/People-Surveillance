import { NextFunction, Request, Response } from 'express';
import HttpStatus from '../constants/status.constant';
import authService, { SanitizedUser } from '../services/auth.service';
import HttpError from '../errors/http.error';

export type AuthenticatedRequest = Request & {
    user?: SanitizedUser;
};

const authMiddleware = async (
    req: Request,
    _: Response,
    next: NextFunction
): Promise<void> => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        next(
            new HttpError(
                HttpStatus.UNAUTHORIZED,
                'Authorization header is missing or malformed'
            )
        );
        return;
    }

    const token = authorizationHeader.split(' ')[1];

    try {
        const payload = authService.verifyToken(token);
        const user = await authService.getSanitizedUserById(payload.userId);
        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;
