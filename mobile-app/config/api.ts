export const API_BASE_URL = 'https://backend-learnai.onrender.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // Account
  PROFILE: `${API_BASE_URL}/a/profile`,
  
  // Chat
  CHAT: `${API_BASE_URL}/chat/chat`,
  
  // Flashcards
  FLASHCARDS: `${API_BASE_URL}/w/flashcards`,
  FLASHCARD_LEARN: (id: string) => `${API_BASE_URL}/w/flashcards/${id}/learn`,
  
  // Quiz
  QUIZ: `${API_BASE_URL}/w/quiz`,
  
  // Orders
  CREATE_ORDER: `${API_BASE_URL}/order/create-order`,
}; 