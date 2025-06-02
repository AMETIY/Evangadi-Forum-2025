import express from 'express';
import {register, login, checkUser} from '../controllers/userController.js';
import {loginLimiter, profileLimiter} from '../middleWare/rateLimiter.js'
import { authenticateToken } from '../middleWare/auth.js';

const router = express.Router();    

// Routes For user registration and Login
router.post('/register', register)
router.post('/login', loginLimiter, login)
router.get('/checkUser',profileLimiter, authenticateToken, checkUser)

export default router