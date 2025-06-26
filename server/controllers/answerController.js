import db from "../config/dbConnection.js";  // My Universal adapter
import { StatusCodes } from "http-status-codes";

//POST a New Answer to a question(protected route)
export const postAnswer = async (req, res) => {
    try{
        // Validating of user(req.user) from JWT middleware
        if (!req.user || !req.user.user_id){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                status: 401,
                error: 'User Authentication Failed'
            })
        };

        const userId = parseInt(req.user.user_id);

        if (isNaN(userId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Invalid user ID'
            });
        }

        // Validating request body
        if (!req.body) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: "Request body is missing",
            });
        }

        // Extracting and Trim input value
        const answer = req.body.answer?.trim();
        const questionId = parseInt(req.body.question_id);

        if (!answer || !questionId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Please provide all required fields(question_id and answer)'
            });
        }

        if (isNaN(questionId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: "Invalid question ID",
            });
        }

        // Validating answer length
        if (answer.length < 10) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: "Answer must be at least 10 characters long",
            });
        }

        if (answer.length > 5000) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                success: false,
                status: 422,
                error: "Answer must not exceed 5000 characters",
            });
        }

        //Checking if the question Exists
        const questionCheck = await db.query('SELECT question_id FROM questions WHERE question_id = ?', [questionId]);

        if (questionCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                status: 404,
                error: 'Question Not Found'
            })
        }

        // Insert answer and get ID (works for both databases!)
        const answerId = await db.insertAndGetId(
            'INSERT INTO answers (question_id, user_id, answer) VALUES (?, ?, ?)',
            [questionId, userId, answer],
            'answer_id'
        );

        //Success response
        res.status(StatusCodes.CREATED).json({
            success: true,
            status: 201,
            message: 'Answer Posted Successful',
            answer_id: answerId,
        });

    }catch (err) {
        console.error("Error posting answer:", err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: 500,
            error: "Failed to post answer. Please try again later.",
        })
    }
}

// GET all answers for a specific question (public route)
export const getAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        const questionId = parseInt(id);

        if (!questionId || isNaN(questionId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Valid question ID is required'
            });
        }

        // First, check if the question exists
        const questionCheck = await db.query('SELECT question_id FROM questions WHERE question_id = ?', [questionId]);

        if (questionCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                status: 404,
                error: 'Question not found'
            });
        }

        // Query to get all answers for the question with user info
        const query = `SELECT a.answer_id, 
            a.answer, 
            a.question_id,
            u.username, 
            u.first_name, 
            u.last_name
            FROM answers a 
            JOIN users u ON a.user_id = u.user_id 
            WHERE a.question_id = ? 
            ORDER BY a.answer_id ASC`;

        const result = await db.query(query, [questionId]);

        // Success response
        res.status(StatusCodes.OK).json({
            success: true,
            status: 200,
            message: 'Answers retrieved successfully',
            question_title: questionCheck.rows[0].title,
            count: result.rows.length,
            answers: result.rows
        });

    } catch (err) {
        console.error('Get answers error:', err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: 500,
            error: 'Failed to retrieve answers. Please try again later.',
        });
    }
};

// GET all answers by a specific user (public route)
export const getAnswersByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const userId = parseInt(user_id);

        if (!userId || isNaN(userId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Valid user ID is required'
            });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT username FROM users WHERE user_id = ?', [userId]);

        if (userCheck.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                status: 404,
                error: 'User not found'
            });
        }

        // Query to get all answers by the user with question info
        const query = `SELECT a.answer_id, 
            a.answer, 
            a.question_id,
            q.title as question_title,
            q.question,
            u.username
            FROM answers a 
            JOIN questions q ON a.question_id = q.question_id
            JOIN users u ON a.user_id = u.user_id 
            WHERE a.user_id = ? 
            ORDER BY a.answer_id DESC`;

        const result = await db.query(query, [userId]);

        // Success response
        res.status(StatusCodes.OK).json({
            success: true,
            status: 200,
            message: 'User answers retrieved successfully',
            username: userCheck.rows[0].username,
            count: result.rows.length,
            answers: result.rows
        });

    } catch (err) {
        console.error('Get answers by user error:', err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: 500,
            error: 'Failed to retrieve user answers. Please try again later.',
        });
    }
};