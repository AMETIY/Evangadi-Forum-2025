import pool from "../config/databaseConfig.js";
import { StatusCodes } from "http-status-codes";
import { questions } from "../schema/tables.js";

//POST  a new question(protected route)
export const postQuestion = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    //Validation of our req.user from JWT middleware
    if (!req.user || !req.user.user_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "User Authentication Failed",
      });
    }

    const userId = parseInt(req.user.user_id);

    if (isNaN(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid User Id",
      });
    }

    // Validating request body
    if (!req.body) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
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
        error:
          "Please provide all required fields(question, title and description)",
      });
    }

    //Validating Field length
    if (question.length > 100) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: "Question must not exceed 100 character",
      });
    }
    if (description.length > 255) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: "description must not exceed 255 character",
      });
    }

    if (title.length > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Title must not exceed 100 characters",
      });
    }

    if (tag && tag.length > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Tag must not exceed 100 characters",
      });
    }

    // Start transaction(inserting in to DB)
    await connection.beginTransaction();

    const insertQuery = `INSERT INTO questions (user_id, title, question, description, tag) VALUES (?, ?, ?, ?, ?)`;

    const [rows] = await connection.execute(insertQuery, [
      userId,
      title,
      question,
      description,
      tag,
    ]);

    // Commit transaction
    await connection.commit();

    //success response
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question posted successfully",
      question_id: rows.insertId,
    });

  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }

    console.error("Error posting question:", err.message);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to post question. Please try again later.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Get all questions with pagination(public route)
export const getAllQuestions = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    //Extracting Pagination Parameters From Query String
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search?.trim() || '';
    const offset = (page - 1) * limit;

    //Validation For Pagination Parameters
    if (page < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Page number must be greater than 0",
      });
    }

    if (limit < 1 || limit > 50) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Limit must be between 1 and 50",
      });
    }

     // Build the WHERE clause for search
    let whereClause = '';
    let queryParams = [];
    let countParams = [];

    if (search) {
      whereClause = `WHERE (
        questions.title LIKE ? OR 
        questions.question LIKE ? OR 
        questions.description LIKE ? OR 
        questions.tag LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      queryParams = [searchPattern, searchPattern, searchPattern, searchPattern];
      countParams = [...queryParams]; // Copy for count query
    }

    //Getting total count of Questions For Pagination information
    const countQuery = `SELECT COUNT(*) as total FROM questions ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, countParams);
    const totalQuestions = countResult[0].total;
    const totalPages = Math.ceil(totalQuestions / limit);

    //Query To Get(Fetch) Paginated Questions with search
    const query = `
    SELECT questions.question_id, 
              questions.title, 
              questions.question, 
              questions.description, 
              questions.tag, 
              questions.time, 
              users.username,
              users.user_id
       FROM questions
       JOIN users ON questions.user_id = users.user_id
       ${whereClause}
       ORDER BY questions.time DESC
       LIMIT ? OFFSET ?
    `;

    // Adding limit and offset to params
    queryParams.push(limit, offset);

    const [rows] = await connection.execute(query, queryParams);

    //Calculating Pagination Metadata
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    //Success response With Pagination Metadata
    res.status(StatusCodes.OK).json({
      success: true,
      message: search ?
      `Found ${totalQuestions} question(s) matching "${search}"` : 
      "Questions Retrieved Successfully",
      data: {
        questions: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalQuestions: totalQuestions,
          questionsPerPage: limit,
          hasNextPage: hasNextPage,
          hasPreviousPage: hasPreviousPage,
          nextPage: hasNextPage ? page + 1 : null,
          previousPage: hasPreviousPage ? page - 1 : null,
        },
        search: search || null
      },
    });


  } catch (err) {
    console.error("Get all questions error:", err.message);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to retrieve questions. Please try again later.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//GET a single question by ID(public route)
export const getQuestionById = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { id } = req.params;
    const numId = parseInt(id);

    if (!numId || isNaN(numId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Valid question ID is required",
      });
    }

    // Query to get a single question
    const query = `SELECT q.*, 
        u.username 
        FROM questions q
        JOIN users u ON q.user_id = u.user_id
        WHERE q.question_id = ?`;

    const [rows] = await connection.execute(query, [numId]);

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Question not found",
      });
    }

    // Success response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question retrieved successfully",
      question: rows[0],
    });

  } catch (err) {
    console.error("Get Question By Id Error:", err.message);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to retrieve question. Please try again later.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Delete and Edit a question(protected route - only question owner)

//Delete a question
export const deleteQuestion = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { id } = req.params;
    const questionId = parseInt(id);
    const userId = req.user?.user_id;

    //validation of our req.user from Our JWT Authentication
    if (!req.user || !req.user.user_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "User Authentication Failed",
      });
    }

    if (isNaN(questionId) || isNaN(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid Question Id or User Id",
      });
    }

    //Here Let's Check Whether the Question Exists and Belongs to the user
    const checkQuery = `SELECT user_id FROM questions WHERE question_id = ?`;
    const [checkRow] = await connection.execute(checkQuery, [questionId]);


    if (checkRow.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Question Not Found",
      });
    }

    //Checking if the user owns the question
    if (checkRow[0].user_id !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: "You Can Only delete your own questions",
      });
    }

    //Starting Transaction
    await connection.beginTransaction();

    //First deleting answers associated with the question to be deleted
    const deleteAnswerQuery = `DELETE FROM answers WHERE question_id = ?`;
    await connection.execute(deleteAnswerQuery, [questionId]);

    //Then After We'll Delete The question itself
    const deleteQuestionQuery = `DELETE FROM questions WHERE question_id = ?`;
    const [deleteQuestionRow] = await connection.execute(deleteQuestionQuery, [
      questionId,
    ]);

    //Committing Transaction
    await connection.commit();

    //Success Response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question Deleted Successfully",
    });

  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }

    console.error("Error Deleting Question:", err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to delete question. Please try again later.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//Updating a question
export const updateQuestion = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { id } = req.params;
    const questionId = parseInt(id);
    const userId = req.user?.user_id;

    //validation of our req.user from Our JWT Authentication
    if (!req.user || !req.user.user_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "User Authentication Failed",
      });
    }

    if (isNaN(questionId) || isNaN(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid Question Id or User Id",
      });
    }

    //Validation
    if (!req.body) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Request body is missing",
      });
    }

    //Extracting the input values also trimming them
    const question = req.body.question?.trim();
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const tag = req.body.tag?.trim() || null;

    //Input Validation
    if (!question || !title || !description) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error:
          "Please provide all required fields(question, title and description)",
      });
    }

    //Validating Field length
    if (question.length > 100) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: "Question must not exceed 100 character",
      });
    }
    if (description.length > 255) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: "description must not exceed 255 character",
      });
    }

    if (title.length > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Title must not exceed 100 characters",
      });
    }

    if (tag && tag.length > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Tag must not exceed 100 characters",
      });
    }

    //Here Let's Check Whether the Question Exists and Belongs to the user
    const checkQuery = `SELECT user_id FROM questions WHERE question_id = ?`;
    const [checkRow] = await connection.execute(checkQuery, [questionId]);

    if (checkRow.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Question Not Found",
      });
    }

    //Checking if the user owns the question
    if (checkRow[0].user_id !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: "You Can Only delete your own questions",
      });
    }

    //Starting Transaction
    await connection.beginTransaction();
    
    const updateQuery = `UPDATE questions SET title = ?, question = ?, description = ?, tag = ? WHERE question_id = ?`;
    const [updateQueryRow] = await connection.execute(updateQuery, [title, question, description, tag, questionId]);

    

    // Commit transaction
        await connection.commit();

        // Success response
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Question updated successfully",
            question_id: questionId,
        });

       

  } catch (err) {

     if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
            }
        }

        console.error("Error updating question:", err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Failed to update question. Please try again later.",
        });

  } finally {
    if (connection) {
            connection.release();
        }
  }
};
