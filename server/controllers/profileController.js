import db from "../config/dbConnection.js";
import { StatusCodes } from "http-status-codes";

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // Join with users to get basic info as well
    const sql = `
      SELECT p.user_profile_id, p.user_id, p.profile_picture, p.phone, p.date_of_birth, p.created_at, p.updated_at,
             u.username, u.first_name, u.last_name, u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = ?
    `;
    const result = await db.query(sql, [user_id]);
    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Profile not found" });
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error("Get profile error:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: "Failed to get profile" });
  }
};

// PUT /api/profile/me
export const updateMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { profile_picture, phone, date_of_birth } = req.body;
    // Only update provided fields
    const fields = [];
    const values = [];
    if (profile_picture !== undefined) {
      fields.push("profile_picture = ?");
      values.push(profile_picture);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone);
    }
    if (date_of_birth !== undefined) {
      fields.push("date_of_birth = ?");
      values.push(date_of_birth);
    }
    if (fields.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: "No fields to update" });
    }
    values.push(user_id);
    const sql = `UPDATE profiles SET ${fields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    const result = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: "Profile not found" });
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: "Failed to update profile" });
  }
};

// GET /api/profile/user/:userId
export const getProfileByUserId = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const sql = `
      SELECT p.user_profile_id, p.user_id, p.profile_picture, p.phone, p.date_of_birth, p.created_at, p.updated_at,
             u.username, u.first_name, u.last_name, u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = ?
    `;
    const result = await db.query(sql, [user_id]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error("Get profile by userId error:", err);
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
};
