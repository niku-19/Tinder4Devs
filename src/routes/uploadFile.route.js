import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth.middleware.js';
import { uploadSingleImage } from '../controllers/uploadFile.controller.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

router.post(
  '/upload-image',
  checkAuth,
  upload.single('image'),
  uploadSingleImage
);

export default router;
