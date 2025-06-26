import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import styles from "./UserAvatar.module.css";
import { profileAPI } from "../../utils/api";

const UserAvatar = ({ userId, username, size = 48 }) => {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAvatar = async () => {
      try {
        // Try to fetch the profile for the given userId
        const res = (await profileAPI.getProfileByUserId)
          ? await profileAPI.getProfileByUserId(userId)
          : null;
        if (
          isMounted &&
          res &&
          res.data &&
          res.data.profile &&
          res.data.profile.profile_picture
        ) {
          setAvatar(res.data.profile.profile_picture);
        } else {
          setAvatar(null);
        }
      } catch {
        setAvatar(null);
      }
    };
    if (userId && profileAPI.getProfileByUserId) {
      fetchAvatar();
    } else {
      setAvatar(null);
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username || "User Avatar"}
        className={styles.avatar}
        style={{ width: size, height: size }}
        onError={(e) => (e.target.src = "/default-avatar.png")}
      />
    );
  }
  return (
    <FaUserCircle
      className={styles.avatar}
      style={{ width: size, height: size }}
    />
  );
};

export default UserAvatar;
