import express from 'express';
import * as lessonController from '../controllers/lessonController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, lessonController.createLesson);
router.get('/', auth, lessonController.getLessons);

export default router;