import rateLimit from 'express-rate-limit';

// Rate limiting for login(5 attempts per 15 minutes per IP))
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limiting each IP to 5 requests per windowMs
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' } 
})


export const profileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Allowing 20 requests per IP
    message: { error: 'Too many profile requests from this IP, please try again after 15 minutes' }
});

export const postQuestionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limiting each IP to 5 requests per windowMs
    message: { error: 'Too many questions posted from this IP, please try again after 15 minutes' }
});

export const postAnswerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limiting each IP to 5 requests per windowMs
    message: { error: 'Too many answers posted from this IP, please try again after 15 minutes' }
});

export const readAnswersLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Too many requests for answers, please try again after 15 minutes' }
});