import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth.middleware.js';
import {
  getMe,
  googleAuth,
  localAuth,
  refreshToken,
  resendOtp,
  resetPassword,
  resetPasswordLink,
  signOut,
  verifyOtp,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', googleAuth);
router.post('/local', localAuth);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);
router.post('/reset-password-link', resetPasswordLink);
router.post('/signOut', checkAuth, signOut);
router.get('/me', checkAuth, getMe);
router.post('/refresh', refreshToken);

export default router;
