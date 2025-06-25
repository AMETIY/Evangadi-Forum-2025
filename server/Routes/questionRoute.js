import express from 'express';
import { deleteQuestion, getAllQuestions, getQuestionById, postQuestion, updateQuestion } from '../controllers/questionController.js';
import {authenticateToken} from '../middleWare/auth.js'
import { postQuestionLimiter } from '../middleWare/rateLimiter.js';



const router = express.Router();

// Protected Route to post a question(with jwt)
router.post('/',postQuestionLimiter, authenticateToken, postQuestion);

// Public route to get all questions
router.get('/', getAllQuestions);

//GET a single question by ID
router.get('/:id', getQuestionById)

//DELETE a question(Protected Route- Only Question Owner)
router.delete('/:id', authenticateToken, deleteQuestion);

//UPDATE EXISTING question(Protected Route- Only Question Owner)
router.patch('/:id', authenticateToken, updateQuestion);

export default router;