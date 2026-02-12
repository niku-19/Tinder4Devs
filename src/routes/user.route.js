import { Router } from 'express';
import {
  deleteUser,
  signIn,
  signUp,
  updateUser,
  userByEmail,
  userById,
  users,
} from '../controllers/user.controller.js';
import { verifyUpdateMiddleware } from '../middleware/verifyUpdate.middleware.js';
import { UPDATE_AVAILABLE } from '../constant/updateAvailable.constant.js';
import { checkAuth } from '../middleware/checkAuth.middleware.js';

const router = Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.get('/user/id/:id', checkAuth, userById);
router.get('/user/email/:email', checkAuth, userByEmail);
router.get('/users', checkAuth, users);
router.delete('/user/id/:id', checkAuth, deleteUser);
router.patch(
  '/user/id/:id',
  checkAuth,
  verifyUpdateMiddleware(UPDATE_AVAILABLE),
  updateUser
);
export default router;
