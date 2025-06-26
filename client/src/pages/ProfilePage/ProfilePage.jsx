import React, { useEffect, useState } from "react";
import styles from "./ProfilePage.module.css";
import { profileAPI } from "../../utils/api";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    profile_picture: "",
    phone: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await profileAPI.getProfile();
        setProfile(res.data.profile);
        setForm({
          profile_picture: res.data.profile.profile_picture || "",
          phone: res.data.profile.phone || "",
          date_of_birth: res.data.profile.date_of_birth || "",
        });
      } catch (err) {
        setStatus({
          message: err.response?.data?.error || "Failed to load profile",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form fields
  const validate = () => {
    if (form.phone && !/^\+?[0-9\- ]{7,20}$/.test(form.phone)) {
      setStatus({ message: "Invalid phone number format.", type: "danger" });
      return false;
    }
    if (form.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(form.date_of_birth)) {
      setStatus({
        message: "Date of birth must be in YYYY-MM-DD format.",
        type: "danger",
      });
      return false;
    }
    if (form.profile_picture && !/^https?:\/\//.test(form.profile_picture)) {
      setStatus({
        message: "Profile picture must be a valid URL.",
        type: "danger",
      });
      return false;
    }
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setStatus({ message: "", type: "" });
    try {
      await profileAPI.updateProfile(form);
      setStatus({ message: "Profile updated successfully!", type: "success" });
      setEditMode(false);
      // Refresh profile
      const res = await profileAPI.getProfile();
      setProfile(res.data.profile);
    } catch (err) {
      setStatus({
        message: err.response?.data?.error || "Failed to update profile",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!profile) {
    return <Alert variant="danger">Profile not found.</Alert>;
  }

  return (
    <div className={styles.profilePageContainer}>
      <div className={styles.profileCard}>
        <h2>My Profile</h2>
        {status.message && (
          <Alert variant={status.type}>{status.message}</Alert>
        )}
        <div className={styles.avatarSection}>
          <FaUserCircle className={styles.avatar} size={110} />
          {editMode && (
            <Form.Group className={styles.formGroup}>
              <Form.Label>Profile Picture URL</Form.Label>
              <Form.Control
                type="url"
                name="profile_picture"
                value={form.profile_picture}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                autoComplete="off"
              />
            </Form.Group>
          )}
        </div>
        <Form onSubmit={handleSubmit} className={styles.profileForm}>
          <Form.Group className={styles.formGroup}>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={profile.username}
              disabled
              readOnly
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={profile.first_name}
              disabled
              readOnly
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={profile.last_name}
              disabled
              readOnly
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={profile.email}
              disabled
              readOnly
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={editMode ? form.phone : profile.phone || ""}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="e.g. +1234567890"
              autoComplete="off"
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="date_of_birth"
              value={
                editMode ? form.date_of_birth : profile.date_of_birth || ""
              }
              onChange={handleChange}
              disabled={!editMode}
              placeholder="YYYY-MM-DD"
              autoComplete="off"
            />
          </Form.Group>
          <div className={styles.buttonRow}>
            {editMode ? (
              <>
                <Button type="submit" variant="success" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      profile_picture: profile.profile_picture || "",
                      phone: profile.phone || "",
                      date_of_birth: profile.date_of_birth || "",
                    });
                    setStatus({ message: "", type: "" });
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
