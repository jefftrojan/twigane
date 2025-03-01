import express from 'express';
import * as progressController from '../controllers/progressController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, progressController.updateProgress);
router.get('/', auth, progressController.getProgress);

export default router;