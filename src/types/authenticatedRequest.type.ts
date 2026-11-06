import { Request } from 'express';
import { SanitizedUser } from '../services/auth.service';

type AuthenticatedRequest = Request & {
    user?: SanitizedUser;
};

export default AuthenticatedRequest;
