import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, profileController.getProfile);
router.patch('/', auth, profileController.updateProfile);
router.delete('/', auth, profileController.deleteProfile);

export default router;