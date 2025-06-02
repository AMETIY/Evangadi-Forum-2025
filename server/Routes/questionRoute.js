import express from 'express';

const router = express.Router();

// Protected Route to post a question(with jwt)
// router.post('/', authetnticateToken, postQuestion);
// Public route to get all questions
// router.get('/', getAllQuestions);
router.post('/', (req, res) => {
    res.json({message: 'Question Posted Successfully'});
})

export default router;