import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Chat from '../models/chat.js';

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: req.user.userId
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};