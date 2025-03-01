import apiClient from './apiClient';

export const contentService = {
  getLearningPath: async () => {
    const response = await apiClient.get('/adaptive/learning-path');
    return response.data;
  },

  getContent: async (contentId: string) => {
    const response = await apiClient.get(`/content/${contentId}`);
    return response.data;
  },

  updateProgress: async (lessonId: string, performance: any) => {
    const response = await apiClient.post(`/adaptive/progress/${lessonId}`, performance);
    return response.data;
  },

  getFeaturedContent: async () => {
    const response = await apiClient.get('/content/featured');
    return response.data;
  }
};