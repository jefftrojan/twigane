import express from 'express';
import { auth } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/start', auth, chatController.startChat);
router.post('/message', auth, chatController.sendMessage);

export default router;