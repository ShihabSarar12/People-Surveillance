import { Router } from 'express';
import blockchainRouter from './blockchain.router';
import authRouter from './auth.router';

const routerV1 = Router();

routerV1.use('/auth', authRouter);
routerV1.use('/blockchain', blockchainRouter);

export default routerV1;
