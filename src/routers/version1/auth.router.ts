import { Router } from 'express';
import authController from '../../controllers/auth.controller';
import { LoginDTO, RegisterDTO } from '../../dtos/auth.dto';
import authenticate from '../../middlewares/auth.middleware';
import validateDTO from '../../middlewares/validateDTO.middleware';

const authRouter: Router = Router();

authRouter.post('/register', validateDTO(RegisterDTO), authController.register);
authRouter.post('/login', validateDTO(LoginDTO), authController.login);
authRouter.get('/profile', authenticate, authController.profile);

export default authRouter;
