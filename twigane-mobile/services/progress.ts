import apiClient from './apiClient';

interface Lesson {
  _id: string;
  title: string;
  subject: string;
}

export interface Progress {
  _id: string;
  lessonId: Lesson;  // Changed from string to Lesson type
  score: number;
  timeSpent: number;
  mistakes: number;
}

class ProgressService {
  async getProgress(): Promise<Progress[]> {
    const response = await apiClient.get('/progress');
    return response.data;
  }

  async updateProgress(data: {
    lessonId: string;
    score: number;
    timeSpent: number;
    mistakes: number;
  }): Promise<Progress> {
    const response = await apiClient.post('/progress', data);
    return response.data;
  }

  async getLearningStats() {
    const response = await apiClient.get('/chat/stats');
    return response.data;
  }
}

export const progressService = new ProgressService();