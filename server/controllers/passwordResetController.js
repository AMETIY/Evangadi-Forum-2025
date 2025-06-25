import pool from "../config/databaseConfig.js";
import { StatusCodes } from "http-status-codes";
import {
  generateResetToken,
  getTokenExpiration,
  isTokenExpired,
  isPasswordStrong,
  hashPassword,
  // checkRateLimit,
} from "../utils/passwordResetUtils.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../services/emailService.js";

//Requesting Password Reset (send email)
export const requestPasswordReset = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

   

    const { email } = req.body;

    // Checking if email is provided
    if (!email || !email.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Please provide your email address",
      });
    }

    const userEmail = email.trim().toLowerCase();

    // Validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail )) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Please provide a valid email address",
      });
    }


    // Finding user by email
    const [users] = await connection.execute(
      "SELECT user_id, username, email FROM users WHERE email = ?",
      [userEmail]
    );

    //success message (if email exists)
    if (users.length === 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message:
          "If an account with that email exists, you will receive a password reset link.",
      });
    }

    const user = users[0];

    // Generating secure reset token
    const resetToken = generateResetToken();
    const tokenExpiration = getTokenExpiration();



    // Saving token to the database
    await connection.execute(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?",
      [resetToken, tokenExpiration, user.user_id]
    );

    // Sending email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    );

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Failed to send reset email. Please try again later.",
      });
    }


    // Success response
    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Something went wrong. Please try again later.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Verifying Reset Token (checking if the link is valid)
export const verifyResetToken = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { token } = req.params;

    // Checking token format
    if (!token || token.length !== 64) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid reset link",
      });
    }

    // Finding user with this token
    const [users] = await connection.execute(
      "SELECT user_id, username, email, reset_token_expires FROM users WHERE reset_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Invalid or expired reset link",
      });
    }

    const user = users[0];

    // Checking if token is expired
    if (isTokenExpired(user.reset_token_expires)) {
      // Cleaning  up expired token
      await connection.execute(
        "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?",
        [user.user_id]
      );

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "This reset link has expired. Please request a new one.",
      });
    }

    // If Token is valid
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Reset link is valid",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Something went wrong. Please try again later.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Resetting Password (Now We can change the password)
export const resetPassword = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // validation
    if (!token || token.length !== 64) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid reset link",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Please provide both password and confirmation",
      });
    }

    if (password !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    // Checking the password strength
    const passwordCheck = isPasswordStrong(password);
    if (!passwordCheck.isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: passwordCheck.message,
      });
    }

    // Finding user with token
    const [users] = await connection.execute(
      "SELECT user_id, username, email, reset_token_expires FROM users WHERE reset_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Invalid or expired reset link",
      });
    }

    const user = users[0];

    // Checking if the token is expired
    if (isTokenExpired(user.reset_token_expires)) {
      // Clean up expired token
      await connection.execute(
        "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?",
        [user.user_id]
      );

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "This reset link has expired. Please request a new one.",
      });
    }



    // Hashing the new password
    const hashedPassword = await hashPassword(password);

    // Updating the password and clearing reset token
    await connection.execute(
      `UPDATE users SET 
        password = ?, 
        reset_token = NULL, 
        reset_token_expires = NULL, 
        last_password_reset = NOW() 
       WHERE user_id = ?`,
      [hashedPassword, user.user_id]
    );

    // Send success email
    try {
      await sendPasswordResetSuccessEmail(user.email, user.username);
    } catch (emailError) {
      console.error("Success email failed (non-critical):", emailError.message);
    }

   
    // Success response
    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Password has been successfully reset! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Something went wrong. Please try again later.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Cleanup expired tokens
export const cleanupExpiredTokens = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token_expires < NOW()"
    );

    if (result.affectedRows > 0) {
      console.info(
        `Cleaned up ${result.affectedRows} expired password reset tokens`
      );
    }
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  } finally {
    if (connection) connection.release();
  }
};
