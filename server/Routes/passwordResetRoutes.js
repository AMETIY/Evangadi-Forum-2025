import express from 'express';
import { 
  requestPasswordReset, 
  verifyResetToken, 
  resetPassword 
} from '../controllers/passwordResetController.js';

const router = express.Router();

// Requesting password reset (send email)
router.post('/forgot-password', requestPasswordReset);

// Verifying if reset token is valid
router.get('/verify-token/:token', verifyResetToken);

// Resetting password with token
router.post('/reset-password/:token', resetPassword);

export default router;