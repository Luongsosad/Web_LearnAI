import express from 'express';
import { synthesizeChat } from '../controllers/ChatController.js';

const chatRoute = express.Router();

// Định nghĩa route cho Text to Script
chatRoute.post('/', synthesizeChat);

export { chatRoute };
