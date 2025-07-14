import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:6789';


console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // Account
  PROFILE: `${API_BASE_URL}/a/profile`,
  
  // Chat
  CHAT: `${API_BASE_URL}/chat`,
  
  // Flashcards
  FLASHCARDS: `${API_BASE_URL}/w/flashcards`,
  FLASHCARD_LEARN: (id: string) => `${API_BASE_URL}/w/flashcards/${id}/learn`,
  
  // Quiz
  QUIZ: `${API_BASE_URL}/w/quiz`,
  
  // Orders
  CREATE_ORDER: `${API_BASE_URL}/order/create-order`,
}; 