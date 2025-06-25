import dotenv from 'dotenv';
dotenv.config();
 import pool from "../config/databaseConfig.js";
 import bcrypt from 'bcrypt';
 import {StatusCodes } from 'http-status-codes';
 import { generateToken } from '../utils/jwt.js'
 

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;


 
//  Register a New User
 export const register = async (req, res) => {
       
    let connection;

    
    try{
        connection = await pool.getConnection();
        
        const {email, first_name, last_name, username, password} = req.body;
        
        //Input Validation
        if (!email ||! first_name || !last_name || !username || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'All fields are required' });
        }
        
        
        // Validating username length
        if (username.length < 3 || username.length > 50) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Username must be between 3 and 50 characters"
            });
        };
        
        // Password length check
        if (!password || password.trim().length < 8) {
            return res.status(StatusCodes.BAD_REQUEST).json({msg: 'Password must be at least 8 characters'});
        };
        
        
            // Start transaction
            await connection.beginTransaction();

        //Checking  Whether The User Existed or Not
        const [rows] = await connection.execute('SELECT user_id, email, username FROM users WHERE email = ? OR username = ?'  , [email, username]);
        // return res.json({user: rows})
        if (rows.length > 0) {

           const existingUser = rows[0];

           if (existingUser.email === email){
             return res.status(StatusCodes.CONFLICT).json({ error: 'An account with this email already exists'});
           }

           if (existingUser.username === username){
             return res.status(StatusCodes.CONFLICT).json({ error: 'This username is already taken'});
           }
        }



        //Hashing the existing password
        // const salt = await bcrypt.genSalt(saltRounds); // Generates a random salt
        const hashedPassword = await bcrypt.hash(password, saltRounds);


         // Insert user into database
        const [inserted] =  await connection.execute('INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)',
            [username, first_name, last_name, email, hashedPassword]);


            //Getting the newly created user
            const [newUser] = await connection.execute('SELECT user_id, username, first_name, last_name, email FROM users WHERE user_id = ?', [inserted.insertId]);

            // Commit transaction
            await connection.commit();


            // ✅ Generate JWT token
            const token = generateToken(newUser[0]);




            // ✅ Success response after JWT
            res.status(StatusCodes.CREATED).json({
            success: true,
            message: "User registered successfully",
            user: {
                user_id: newUser[0].user_id,
                username: newUser[0].username,
                first_name: newUser[0].first_name,
                last_name: newUser[0].last_name,
                email: newUser[0].email
            },
            token
        });


    }catch (err) {

        if (connection) {
            try {
                await connection.rollback();

            }catch(rollbackErr){
                console.error('Rollback error:', rollbackErr)

            }
        }

        
        console.error("Registration error:", err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(StatusCodes.CONFLICT).json({ error: 'Username or email already exists' });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Registration failed. Please try again later." });
    }finally{
        if(connection){
            connection.release();
        }
    }

    }



 //User Login 
 export const login = async (req, res) => {
    let connection;

     
     try{
         connection = await pool.getConnection();
        
        const {email, password} = req.body;
       

        //Input Validation
    if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email and Password are Required'});
        }

        //Finding a user using email
        const [rows] = await connection.execute('SELECT user_id, username, first_name, last_name, email, password  FROM users WHERE email = ?', [email]);
        // return res.json({rows: rows});
        
        if (rows.length === 0) {
           return  res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email or password'});
        }

          
        const user = rows[0];

        // Verifying password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password'})
        }


        // ✅ Generate JWT token
        const token = generateToken(user);


        // ✅ Success response (WITH OUT THE password)
         res.status(StatusCodes.OK).json({
            success: true,
            message: "Login successful",
            user: {
                user_id: user.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            },
            token
        });

   


    }catch (err) {
        console.error('Login Error:', err.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            status: 500,
            error: 'Login failed. Please try again later'
        });

    }finally {
        if(connection){
            connection.release();
        }

    }
 }



// Get User Profile(protected route)
export const checkUser = async (req, res) => {
     let connection; 
    
    try {
        connection = await pool.getConnection();
        // req.user comes from JWT middleware(req.user)
        const userId = req.user.user_id;

        const [users] = await connection.execute(
            'SELECT user_id, username, first_name, last_name, email FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            console.warn(`User with ID ${userId} not found in DB`);
            return res.status(StatusCodes.NOT_FOUND).json({
                 success: false,
                 status: 404,
                error: "User not found"
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            status: 200,
            message: "User profile retrieved successfully",
            user: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: 500,
            error: "Failed to get user profile"
        });
    } finally {
        if(connection){
            connection.release();
        }
    }
}