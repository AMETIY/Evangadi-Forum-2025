import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import styles from "./UserAvatar.module.css";
import { profileAPI } from "../../utils/api";

const UserAvatar = ({ userId, username, size = 48 }) => {
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAvatar = async () => {
      if (!userId) {
        setAvatar(null);
        return;
      }

      // Skip API call if we've already had an error (to prevent continuous flickering)
      if (hasError) {
        setAvatar(null);
        return;
      }

      try {
        setIsLoading(true);

        const response = await profileAPI.getProfileByUserId(userId);

        if (
          isMounted &&
          response?.data?.success &&
          response.data.profile?.profile_picture
        ) {
          setAvatar(response.data.profile.profile_picture);
        } else {
          setAvatar(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching avatar for user", userId, ":", error);
          setAvatar(null);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAvatar();

    return () => {
      isMounted = false;
    };
  }, [userId, hasError]);

  // Show profile picture if available
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username || "User Avatar"}
        className={styles.avatar}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = "none";
          setAvatar(null);
          setHasError(true);
        }}
      />
    );
  }

  // Show default avatar (no flickering)
  return (
    <FaUserCircle
      className={styles.avatar}
      style={{ width: size, height: size }}
    />
  );
};

export default UserAvatar;
