import { StatusCodes } from "http-status-codes"; 
import {verifyToken} from '../utils/jwt.js'

export const authenticateToken = async (req, res, next) =>{
    const authHeader = req.headers['authorization'];  //Expected format: "Bearer <token>"

     // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        error: 'Access denied. No token provided.',
        message: 'Access denied. No valid token provided.' 
    });
    };


    // Extract token from the string "Bearer <token>" 
     const token = authHeader && authHeader.split(' ')[1]; 

     if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
            success: false, 
            error: 'Access token is required',
            message: 'Access token is required' 
        });
    }


    
        const tokenResult = verifyToken(token);  //calling our verifyToken() back in jwt

        if (!tokenResult.success) {
            console.error('Token verification error:', tokenResult.message)

            if (tokenResult.error === 'TOKEN_EXPIRED') {

             return res.status(StatusCodes.UNAUTHORIZED).json({ 
                success: false,
                error: 'TOKEN_EXPIRED',
                message: 'Your session has expired. Please login again.',
                shouldLogout: true  // Signal to frontend to logout
            });
        }

         if (tokenResult.error === 'INVALID_TOKEN') {
            return res.status(StatusCodes.FORBIDDEN).json({ 
                success: false,
                error: 'INVALID_TOKEN',
                message: 'Invalid authentication token.',
                shouldLogout: true  
            });
        }

        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: 'TOKEN_ERROR',
            message: 'Authentication failed.',
            shouldLogout: true 
        })
        }

        

          
          req.user = tokenResult.decoded; // Attach decoded user data (user_id, username, email) to request
          req.tokenInfo = {
            isValid: true,
            expiresAt: tokenResult.decoded.exp
          }

          next(); 
          
}