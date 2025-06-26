import React from "react";
import styles from "./QuestionInfo.module.css";
import { FaAngleRight, FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const path = `/question/${questionId}`;

  //Here We Check if current user is the owner of this question
  const isOwner = user && user.user_id === userId;

  //Function For edit button click
  const handleEdit = () => {
    navigate(`/edit/${questionId}`);
  };

  const handelDeleteClick = () => {
    setShowDeleteModal(true);
    setError("");
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
            </div>
          </div>

          <div className={styles.askArrow}>
            {/* Show edit and delete buttons only for question owner */}
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
