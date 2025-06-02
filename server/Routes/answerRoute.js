import express from 'express';

const router = express.Router();

//Protected route to Post an Answer(using JWT)
// router.post('/', authetnticateToken, postAnswer)

// Public route to get answers for a question
// router.get('/:id', getAnswers)
router.get('/', (req, res) => {
    res.json({message: 'Answer'})
})

export default router;