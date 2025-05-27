import express from 'express';
import { synthesizeChat, synthesizeCommunicate } from '../controllers/ChatController.js';

const chatRoute = express.Router();

// Định nghĩa route cho Text to Script
chatRoute.post('/', synthesizeChat);
chatRoute.post('/communicate', synthesizeCommunicate);

export { chatRoute };
