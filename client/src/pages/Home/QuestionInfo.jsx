import React from "react";
import styles from "./QuestionInfo.module.css";
import {
  FaAngleRight,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaEye,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { questionsAPI } from "../../utils/api";
import { Alert, Button } from "react-bootstrap";
import DeleteConfirmationModal from "../DeleteQuestionModal/DeleteConfirmationModal";
import UserAvatar from "../../Components/Profile/UserAvatar";

const QuestionInfo = ({
  username,
  title,
  questionId,
  userId,
  onQuestionDeleted,
  viewCount = 0,
  likeCount = 0,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [views, setViews] = useState(viewCount);
  const [likes, setLikes] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const path = `/question/${questionId}`;

  //Here We Check if current user is the owner of this question
  const isOwner = user && user.user_id === userId;

  // Check if user has liked this question
  useEffect(() => {
    const checkUserLike = async () => {
      if (user) {
        try {
          const response = await questionsAPI.getStats([questionId]);
          if (response.data.success) {
            const stats = response.data.data[questionId];
            if (stats) {
              setViews(stats.views);
              setLikes(stats.likes);
            }
          }
        } catch (err) {
          console.error("Error checking user like status:", err);
        }
      }
    };

    checkUserLike();
  }, [questionId, user]);

  //Function For edit button click
  const handleEdit = () => {
    navigate(`/edit/${questionId}`);
  };

  const handelDeleteClick = () => {
    setShowDeleteModal(true);
    setError("");
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      setLikeLoading(true);
      const response = await questionsAPI.toggleLike(questionId);

      if (response.data.success) {
        if (response.data.action === "liked") {
          setLikes((prev) => prev + 1);
          setIsLiked(true);
        } else {
          setLikes((prev) => prev - 1);
          setIsLiked(false);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to update like. Please try again.");
    } finally {
      setLikeLoading(false);
    }
  };

  //After The user Clicked the Delete Button and After Confirming to Delete in the Modal
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      setError("");

      const response = await questionsAPI.deleteQuestion(questionId);

      if (response.data.success) {
        setShowDeleteModal(false);
        // Calling the parent component's callback to refresh the questions list(callback props)
        if (onQuestionDeleted) {
          onQuestionDeleted(questionId);
        }
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        "Failed to delete question. Please try again.";
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  //Or if He Rejects
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setError("");
  };

  return (
    <>
      <div className={styles.questionsContainer}>
        <hr />
        <div className={styles.askQuestion}>
          <div className={styles.askUserInfo}>
            <div className={styles.askUser}>
              <Link to={path}>
                <UserAvatar userId={userId} username={username} size={65} />
              </Link>
              <span className={styles.username}>{username}</span>
            </div>
            <div className={styles.askQuestionText}>
              <p>{title}</p>
              {/* Stats Row under the title */}
              <div className={styles.questionStatsRow}>
                {/* Like button with vote count */}
                <button
                  className={`${styles.likeButton} ${
                    isLiked ? styles.liked : ""
                  } ${likeLoading ? styles.loading : ""}`}
                  onClick={handleLike}
                  disabled={likeLoading}
                  title={isLiked ? "Unlike" : "Like"}
                  type="button"
                >
                  {isLiked ? (
                    <FaHeart className={styles.statIcon} />
                  ) : (
                    <FaRegHeart className={styles.statIcon} />
                  )}
                  <span className={styles.statCount}>{likes}</span>
                </button>
                <div className={styles.statItem} title="Views">
                  <FaEye className={styles.statIcon} />
                  <span className={styles.statCount}>{views} views</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.askArrow}>
            {/* Only keep action buttons for owners here, remove old statsSection and like button */}
            {isOwner && (
              <div className={styles.actionButtons}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleEdit}
                  className={styles.editBtn}
                  title="Edit Question"
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handelDeleteClick}
                  className={styles.deleteBtn}
                  title="Delete Question"
                >
                  <FaTrash />
                </Button>
              </div>
            )}

            <Link to={path}>
              <FaAngleRight className={styles.icon} size={25} />
            </Link>
          </div>
        </div>

        {/* {Error Display} */}
        {error && (
          <Alert variant="danger" className={styles.errorAlert}>
            {error}
          </Alert>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        questionTitle={title}
      />
    </>
  );
};

export default QuestionInfo;
