import express from 'express';
import { synthesizeAudio, synthesizeTTS } from '../controllers/AudioController.js';

const audioRoute = express.Router();

// Định nghĩa route cho Text to Script
audioRoute.post('/', synthesizeAudio);
audioRoute.post('/voice', synthesizeTTS);

export { audioRoute };
