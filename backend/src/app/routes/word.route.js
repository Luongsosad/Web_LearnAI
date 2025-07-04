import express from 'express';
import {
  getAllCategories,
  createCategory,
  getTopicsByCategoryId,
  createTopic,
  getWordsByTopicId,
  createWord,
  generateQuestions,
} from '../controllers/WordController.js';

const wordRoute = express.Router();

// Generate questions for a word
wordRoute.get('/generate-questions', generateQuestions);

// categories
wordRoute.get('/categories', getAllCategories);
wordRoute.post('/categories', createCategory);

// topics
wordRoute.get('/categories/:categoryId/topics', getTopicsByCategoryId);
wordRoute.post('/topics', createTopic);

// words
wordRoute.get('/topics/:topicId/words', getWordsByTopicId);
wordRoute.post('/words', createWord);

export { wordRoute };
