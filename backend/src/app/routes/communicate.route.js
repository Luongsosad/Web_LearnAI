import express from 'express';
import { synthesizeCommunicate } from '../controllers/CommunicateController.js';

const communicateRoute = express.Router();

// Định nghĩa route cho communicate
communicateRoute.post('/', synthesizeCommunicate);

export { communicateRoute };
