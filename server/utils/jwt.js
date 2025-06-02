import jwt from 'jsonwebtoken';


// Ensuring the JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment');
}


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'
export const generateToken = (user) => {
    const payload = {    //payload here
        user_id: user.user_id,
        username: user.username,
        email: user.email
    }

    return jwt.sign(payload,
    JWT_SECRET,
    {expiresIn: JWT_EXPIRES_IN}
);
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
}