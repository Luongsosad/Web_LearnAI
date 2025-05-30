import express from 'express';
import { getVocabularyData } from '../controllers/DataController.js';

const dataRoute = express.Router();

// Route GET /api/vocabulary
dataRoute.get('/vocabulary', getVocabularyData);

export { dataRoute };
