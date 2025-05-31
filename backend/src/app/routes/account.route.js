import express from 'express';
import { GetProfile } from '../controllers/AccountController.js';


const accountRoute = express.Router();

accountRoute.get('/profile', GetProfile);


export { accountRoute };
