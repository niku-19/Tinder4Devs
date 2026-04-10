import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth.middleware.js';
import {
  createProfile,
  discoverProfiles,
  getProfile,
} from '../controllers/profile.controller.js';

const router = Router();

router.post('/', checkAuth, createProfile);
router.get('/', checkAuth, getProfile);
router.get('/discover', checkAuth, discoverProfiles);

export default router;
