import express from 'express';
import {authenticateToken} from '../middleWare/auth.js'
import { getAnswers, getAnswersByUser, postAnswer } from '../controllers/answerController.js';
import { postAnswerLimiter, readAnswersLimiter } from '../middleWare/rateLimiter.js';

const router = express.Router();

//Protected route to Post an Answer(using JWT)
router.post('/',postAnswerLimiter, authenticateToken, postAnswer)

// Public route to get answers for a question
router.get('/:id',readAnswersLimiter, getAnswers)
// Public route to get answers by a specific user
router.get('/user/:user_id', readAnswersLimiter, getAnswersByUser);

export default router;