import express from 'express';
import { GetProfile, GetProfileDetail } from '../controllers/AccountController.js';

const accountRoute = express.Router();

accountRoute.get('/profile', GetProfile);
accountRoute.get('/profile-detail', GetProfileDetail);

export { accountRoute };
