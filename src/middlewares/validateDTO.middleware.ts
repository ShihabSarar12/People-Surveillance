import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import ClassConstructor from '../types/classConstructor.type';
import HttpsStatus from '../constants/status.constant';

const validateDTO =
    <T extends object>(type: ClassConstructor<T>) =>
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> => {
        const object: T = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(object);

        if (errors.length > 0) {
            return res.status(HttpsStatus.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: errors.map((error) => ({
                    property: error.property,
                    constraints: Object.values(error.constraints || {}),
                })),
            });
        }

        next();
    };

export default validateDTO;
