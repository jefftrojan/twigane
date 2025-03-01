import apiClient from './apiClient';

interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'flipcard' | 'quiz';
  metadata?: {
    cardFront?: string;
    cardBack?: string;
    category?: string;
    points?: number;
    correctAnswer?: string;
  };
  timestamp: Date;
}

interface ChatSession {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  learningProgress: {
    cardsReviewed: number;
    correctAnswers: number;
    points: number;
    streakDays: number;
    achievements: string[];
  };
}

class ChatService {
  async startChat(): Promise<ChatSession> {
    const response = await apiClient.post('/chat/start');
    return response.data;
  }

  async sendMessage(chatId: string, message: string, type: string = 'text') {
    const response = await apiClient.post('/chat/message', {
      chatId,
      message,
      type
    });
    return response.data;
  }

  async getChatHistory(): Promise<ChatSession[]> {
    const response = await apiClient.get('/chat/history');
    return response.data;
  }

  async submitQuizAnswer(chatId: string, messageId: string, answer: string) {
    const response = await apiClient.post('/chat/quiz/answer', {
      chatId,
      messageId,
      answer
    });
    return response.data;
  }
}

export const chatService = new ChatService();