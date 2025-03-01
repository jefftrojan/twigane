import express from 'express';
import { auth } from '../middleware/auth.js';
import * as adaptiveController from '../controllers/adaptiveController.js';

const router = express.Router();

router.get('/personalized', auth, adaptiveController.getPersonalizedContent);
router.post('/learning-path', auth, adaptiveController.updateLearningPath);
router.get('/recommendations', auth, adaptiveController.getRecommendations);
router.get('/engagement-metrics', auth, adaptiveController.getEngagementMetrics);
router.post('/feedback', auth, adaptiveController.submitFeedback);

export default router;