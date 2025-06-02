import { StatusCodes } from "http-status-codes"; 
import {verifyToken} from '../utils/jwt.js'

export const authenticateToken = async (req, res, next) =>{
    const authHeader = req.headers['authorization'];  //Expected format: "Bearer <token>"

     // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Access denied. No token provided.' });
    };


    // Extract token from the string "Bearer <token>" 
     const token = authHeader && authHeader.split(' ')[1]; 

     if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ status: 401, error: 'Access token is required' });
    }


    try{
        const decoded = verifyToken(token);
        // return res.status(StatusCodes.OK).json({msg: decoded})
        req.user = decoded; // Attach decoded user data (user_id, username, email) to req
        next(); 

    }catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(StatusCodes.FORBIDDEN).json({ status: 403, error: 'Token has expired' });
        }
        return res.status(StatusCodes.FORBIDDEN).json({ status: 403, error: 'Invalid token' });

    }
}