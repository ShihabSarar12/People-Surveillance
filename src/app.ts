import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import errorMiddleware from './middlewares/error.middleware';
import limiter from './configs/rateLimiter.config';
import swaggerOptions from './configs/documentation.config';
import routerV1 from './routers/version1/index.router';
import HttpStatus from './constants/status.constant';
import {
    contentSecurityPolicyConfig,
    hstsConfig,
} from './configs/helmet.config';
import { NODE_ENV } from './constants/env.constants';
import corsConfig from './configs/cors.config';

const app: Application = express();

app.use(limiter);

app.use(
    express.json({
        limit: '5mb',
    }),
);
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsConfig));

app.use(helmet());
app.use(helmet.contentSecurityPolicy(contentSecurityPolicyConfig));

app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());
if (NODE_ENV === 'production') {
    app.use(helmet.hsts(hstsConfig));
}
app.use(
    helmet.referrerPolicy({
        policy: 'strict-origin-when-cross-origin',
    }),
);
app.use(helmet.frameguard({ action: 'deny' }));
app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader('Permissions-Policy', 'fullscreen=(self), geolocation=()');
    next();
});

app.set('etag', false);

// app.use('/api/v1', routerV1);
app.all('/hello', async (req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
        success: true,
    });
});

const swaggerSpec: object = swaggerJsdoc(swaggerOptions);
const swaggerJsonPath: string = path.join(
    __dirname,
    'documentation',
    'swagger.json',
);
fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerSpec, null, 2));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.all('/', (req: Request, res: Response): void => {
    res.status(HttpStatus.OK).send('Hello, TypeScript with Express!');
});

app.use(errorMiddleware.errorHandler);
app.use(errorMiddleware.notFound);

export default app;
