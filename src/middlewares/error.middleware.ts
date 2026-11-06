import { Request, Response, NextFunction } from 'express';
import logger from '../utilities/logger.utility';
import HttpStatus from '../constants/status.constant';
import { NODE_ENV } from '../constants/env.constants';
import HttpError from '../errors/http.error';

class ErrorMiddleware {
    constructor() {}

    public errorHandler = (
        err: Error,
        _: Request,
        res: Response,
        __: NextFunction
    ): Response => {
        if (err instanceof HttpError) {
            logger.warn(err.message);
            return res.status(err.statusCode).json({
                success: err.success,
                message: err.message,
            });
        }

        logger.error(err.stack);
        logger.error('An error occurred. ', err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'An unexpected error occurred.',
            ...(NODE_ENV !== 'production' && {
                error: err.message || 'Internal server error',
            }),
        });
    };

    public notFound = (_: Request, res: Response): Response => {
        return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'Resource not found.',
        });
    };
}

export default new ErrorMiddleware();
