import express from 'express';
import {
  generatePracticeSentences,
  generateAudioWithSpeed,
  checkUserAnswer,
} from '../controllers/ListenPracticeController.js';

const router = express.Router();

// Generate practice sentences with audio
router.post('/generate', generatePracticeSentences);

// Generate audio with different speeds
router.post('/audio', generateAudioWithSpeed);

// Check user answer
router.post('/check', checkUserAnswer);

export { router as listenPracticeRoute };
