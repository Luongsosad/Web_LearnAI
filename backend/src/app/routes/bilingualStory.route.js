import express from 'express';
import { getBilingualStories, getWordInfo, getMultipleWordInfo } from '../controllers/BilingualStoryController.js';

const router = express.Router();

// Lấy danh sách truyện song ngữ theo chủ đề (có sẵn nội dung và audio_en)
router.get('/', getBilingualStories);
// Lấy thông tin từ/cụm tiếng Anh (phát âm, nghĩa, audio)
router.get('/word-info', getWordInfo);
// Lấy thông tin nhiều từ/cụm tiếng Anh cùng lúc
router.post('/multiple-word-info', getMultipleWordInfo);

export { router as bilingualStoryRoute };
