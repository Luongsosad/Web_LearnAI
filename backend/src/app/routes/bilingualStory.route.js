import express from 'express';
import { getBilingualStories, getWordInfo } from '../controllers/BilingualStoryController.js';

const router = express.Router();

// Lấy danh sách truyện song ngữ theo chủ đề (có sẵn nội dung và audio_en)
router.get('/', getBilingualStories);
// Lấy thông tin từ/cụm tiếng Anh (phát âm, nghĩa, audio)
router.get('/word-info', getWordInfo);

export { router as bilingualStoryRoute };
