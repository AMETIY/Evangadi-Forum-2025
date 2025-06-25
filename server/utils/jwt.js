import jwt from 'jsonwebtoken';


// Ensuring the JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment');
}


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const generateToken = (user) => {
    const payload = {    //payload here
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)   //Adding Issued at time for tracking
    }

    return jwt.sign(payload,
    JWT_SECRET,
    {expiresIn: JWT_EXPIRES_IN}
);
};


export const verifyToken =  (token) => {

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            success: true,
            decoded
        };

    }catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                success: false,
                error: 'TOKEN_EXPIRED',
                message: 'Token has expired'
            }
        }

        if (error.name === 'JsonWebTokenError') {
            return {
                success: false,
                error: 'INVALID_TOKEN', 
                message: 'Invalid token' 
            }
        }

        return {
            success: false,
            error: 'Token ERROR',
            message: 'Token verification failed'
        }

    }
}

//Checking if Token is about to expire(refreshing before expiry)
export const isTokenExpiringSoon = (token) => {
    try{

        const decoded = jwt.decode(token);   //decoding the JWT Token w/o verifying the signature
        if (!decoded || !decoded.exp) return true;   //checking if the token can't be decoded(no expiry)(if yes treating it as expired)

        const currentTime = Math.floor(Date.now() / 1000)  //JWT tokens store time in Unix timestamp format (seconds)
        const timeUntilExpiry = decoded.exp - currentTime;

        return timeUntilExpiry < 3600;  //Return true if token expires in less than 1 hour (3600 seconds)

    }catch (error) {
        return true;

    }
}