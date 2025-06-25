import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Generate a secure random token for password reset
export const generateResetToken = () => {
  // Creates a 64-character random string (very secure!)
  return crypto.randomBytes(32).toString('hex');
};

// Calculating when the token should expire (30 minutes from now)
export const getTokenExpiration = () => {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 30); // 30 minutes
  return expiration;
};

// Checking if a token has expired
export const isTokenExpired = (expirationDate) => {
  const now = new Date();
  const expiry = new Date(expirationDate);
  return now > expiry;
};

// Checking if password is strong enough
export const isPasswordStrong = (password) => {
  // Must be at least 8 characters
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Must have uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter' 
    };
  }

  // Must have lowercase letter
  if (!/[a-z]/.test(password)) {
    return { 
        isValid: false, 
        message: 'Password must contain at least one lowercase letter' 
    };
  }

  // Must have number
  if (!/\d/.test(password)) {
    return { 
        isValid: false, 
        message: 'Password must contain at least one number' 
    };
  }

  // Must have special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
        isValid: false, 
        message: 'Password must contain at least one special character (!@#$%^&*)' 
    };
  }

  return { 
    isValid: true, 
    message: 'Password is strong!' 
};
};

// Hashing the password securely
export const hashPassword = async (password) => {
  const saltRounds = 12; // Very secure
  return await bcrypt.hash(password, saltRounds);
};

// Comparing password with stored hash
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};


// Rate limiting function for password reset requests
// export const checkRateLimit = (email, maxAttempts = 3, windowMs = 15 * 60 * 1000) => {
//   const now = Date.now();
//   const key = `reset_${email}`;
  
//   if (!rateLimitStore.has(key)) {
//     rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
//     return { allowed: true, remaining: maxAttempts - 1 };
//   }
  
//   const data = rateLimitStore.get(key);
  
//   // Check if window has expired
//   if (now - data.firstAttempt > windowMs) {
//     rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
//     return { allowed: true, remaining: maxAttempts - 1 };
//   }
  
//   // Check if max attempts reached
//   if (data.attempts >= maxAttempts) {
//     const timeLeft = windowMs - (now - data.firstAttempt);
//     return { 
//       allowed: false, 
//       remaining: 0, 
//       timeLeftMs: timeLeft,
//       timeLeftMinutes: Math.ceil(timeLeft / 60000)
//     };
//   }
  
//   // Increment attempts
//   data.attempts++;
//   rateLimitStore.set(key, data);
  
//   return { allowed: true, remaining: maxAttempts - data.attempts };
// };

// // Cleanup expired rate limit entries
// export const cleanupRateLimit = () => {
//   const now = Date.now();
//   const windowMs = 15 * 60 * 1000; // 15 minutes
//   let cleanedCount = 0;
  
//   for (const [key, data] of rateLimitStore.entries()) {
//     if (now - data.firstAttempt > windowMs) {
//       rateLimitStore.delete(key);
//       cleanedCount++;
//     }
//   }
  
//   if (cleanedCount > 0) {
//     console.log(`🧹 Cleaned up ${cleanedCount} expired rate limit entries`);
//   }
// };