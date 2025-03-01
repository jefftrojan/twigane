import express from 'express';
import { auth } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/track-session', auth, analyticsController.trackSession);
router.get('/engagement', auth, analyticsController.getUserEngagement);
router.get('/insights', auth, analyticsController.getPersonalizedInsights);

export default router;