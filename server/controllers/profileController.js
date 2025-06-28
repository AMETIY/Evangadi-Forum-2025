import db from "../config/dbConnection.js";
import { StatusCodes } from "http-status-codes";

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // Simple query that matches your original working version
    const sql = `
      SELECT p.user_profile_id, p.user_id, p.profile_picture, p.phone, p.date_of_birth, p.created_at, p.updated_at,
             u.username, u.first_name, u.last_name, u.email
      FROM users u
      LEFT JOIN profiles p ON u.user_id = p.user_id
      WHERE u.user_id = ?
    `;
    const result = await db.query(sql, [user_id]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "User not found",
      });
    }
    let profile = result.rows[0];
    // If no profile exists, create a basic one
    if (!profile.user_profile_id) {
      console.log("Creating new profile for user:", user_id);
      // Create profile with NULL values
      await db.query(
        "INSERT INTO profiles (user_id, profile_picture, phone, date_of_birth) VALUES (?, NULL, NULL, NULL)",
        [user_id]
      );
      // Fetch the profile again
      const newResult = await db.query(sql, [user_id]);
      profile = newResult.rows[0];
    }
    // Return the profile data
    res.json({
      success: true,
      profile: profile,
    });
  } catch (err) {
    console.error("Get profile error:", err.message);
    console.error("Full error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to get profile",
    });
  }
};

// PUT /api/profile/me
export const updateMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let { profile_picture, phone, date_of_birth } = req.body;

    console.log("Updating profile for user:", user_id);
    console.log("Received data:", { profile_picture, phone, date_of_birth });

    // 🔧 FIX: Handle empty strings properly - convert to NULL
    profile_picture =
      profile_picture && profile_picture.trim() !== ""
        ? profile_picture.trim()
        : null;
    phone = phone && phone.trim() !== "" ? phone.trim() : null;
    date_of_birth =
      date_of_birth && date_of_birth.trim() !== ""
        ? date_of_birth.trim()
        : null;

    console.log("Cleaned data:", { profile_picture, phone, date_of_birth });

    // Validate date_of_birth format if provided
    if (date_of_birth !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date_of_birth)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Date of birth must be in YYYY-MM-DD format",
        });
      }
      // Validate it's a real date
      const dateObj = new Date(date_of_birth + "T00:00:00.000Z");
      if (isNaN(dateObj.getTime())) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Invalid date value",
        });
      }
      // Check if date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj > today) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Date of birth cannot be in the future",
        });
      }
    }

    // Check if profile exists
    const existingProfile = await db.query(
      "SELECT user_profile_id FROM profiles WHERE user_id = ?",
      [user_id]
    );

    if (existingProfile.rows.length === 0) {
      console.log("Creating new profile during update");
      // Create new profile
      const insertResult = await db.query(
        "INSERT INTO profiles (user_id, profile_picture, phone, date_of_birth) VALUES (?, ?, ?, ?)",
        [user_id, profile_picture, phone, date_of_birth]
      );
      console.log("Profile created, insert result:", insertResult);
    } else {
      console.log("Updating existing profile");
      // Update existing profile
      const updateResult = await db.query(
        "UPDATE profiles SET profile_picture = ?, phone = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
        [profile_picture, phone, date_of_birth, user_id]
      );
      console.log("Profile updated, update result:", updateResult);
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    console.error("Full error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

// GET /api/profile/user/:userId
export const getProfileByUserId = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const sql = `
      SELECT p.user_profile_id, p.user_id, p.profile_picture, p.phone, p.date_of_birth, p.created_at, p.updated_at,
             u.username, u.first_name, u.last_name, u.email
      FROM users u
      LEFT JOIN profiles p ON u.user_id = p.user_id
      WHERE u.user_id = ?
    `;
    const result = await db.query(sql, [user_id]);
    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("Get profile by userId error:", err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Failed to get profile",
    });
  }
};
