// import dotenv from 'dotenv';
// dotenv.config();
import pool from "../config/databaseConfig.js";
import { StatusCodes } from "http-status-codes";


//POST  a new question(protected route)
export const postQuestion = async (req, res) => {
    let connection;

    try{
        
        //Validation of our req.user from JWT middleware
        if (!req.user || !req.user.user_id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                status: 401,
                error: 'User Authentication Failed'
            });
        }
        
        const userId = parseInt(req.user.user_id);
        
        if (isNaN(userId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Invalid User Id'
            });
        }



        // Checking if req.body is defined
    if (!req.body) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        status: 400,
        error: "Request body is missing",
      });
    }


        // Extracting and Trim input value
        const question = req.body.question?.trim();
        const title = req.body.title?.trim();
        const description = req.body.description?.trim();
        const tag = req.body.tag?.trim() || null;
        

        //Input Validation
        if (!question || !title || !description) {
           return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Please provide all required fields(question, title and description)'
            });
        }
        
        //Validating Field length
        if (question.length > 255) {
           return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Question must not exceed 255 character'
            });
        }
        
        if (title.length > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: 'Title must not exceed 100 characters'
            });
        }
        
        if (tag && tag.length > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                status: 400,
                error: "Tag must not exceed 100 characters"
            });
        }
        
        connection = await pool.getConnection();

        // Start transaction(inserting in to DB)
        await connection.beginTransaction();
        
            const insertQuery = `INSERT INTO questions (user_id, title, question, description, tag) VALUES (?, ?, ?, ?, ?)`;

            const [rows] = await connection.execute(insertQuery, [
                 userId,
                 title,
                 question, 
                 description,
                 tag
            ]);


            // Commit transaction
             await connection.commit();


            res.status(StatusCodes.CREATED).json({
                success: true,
                status: 201,
                message: 'Question posted successfully',
                question_id: rows.insertId
            });


     console.log(`Question posted by user ID ${userId}: Question ID ${rows.insertId}`);



    }catch (err) {
        if (connection) {
            try {
                await connection.rollback();

            }catch(rollbackErr){
                console.error('Rollback error:', rollbackErr)

            }
        }
        
        console.error('Error posting question:', err.message);

         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: 500,
             error: "Failed to post question. Please try again later." 
            });

    }finally{
        if(connection){
            connection.release();
        }
    }
}


//