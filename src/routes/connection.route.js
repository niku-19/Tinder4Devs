import { Router } from 'express';
import { connectionRequest } from '../controllers/connection.controller.js';
import { checkAuth } from '../middleware/checkAuth.middleware.js';

const router = Router();

router.post('/send/:status/:userId', checkAuth, connectionRequest);

export default router;
