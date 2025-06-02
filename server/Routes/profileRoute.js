import express from 'express';



const router = express.Router();

//Protected route for Creating or updating a profile 
// router.post('/', authetnticateToken, createOrUpdateProfile);

// Public route for Getting a profile by user_id
// router.post('/:user_id', getProfile);


router.post('/', (req, res) => {
    console.log("🟢 /api/profiles/ POST route hit!");
    res.json({message: 'Welcome User'})
});

export default router;