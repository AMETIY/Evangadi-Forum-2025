import React, { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { answersAPI, questionsAPI } from "../../utils/api";
import { Alert, Button, Spinner } from "react-bootstrap";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { BsPatchQuestionFill } from "react-icons/bs";
import styles from "./QuestionPage.module.css";
import PostAnswer from "./PostAnswer";

const QuestionPage = () => {
  const { id } = useParams();
  const [answers, setAnswers] = useState([]); //MANY answers for one question w/c is an array form
  const [allAnswers, setAllAnswers] = useState([]); // Store all answers
  const [questionData, setQuestionData] = useState({}); //single data w/c is in the form of object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayedAnswer, setDisplayedAnswer] = useState(4);
  const { user, token, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /// Waiting for auth to load and ensure user is authenticated
    if (!loading && isAuthenticated && id) {
      fetchQuestionAndAnswers();
    } else if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/auth?mode=login");
    }
  }, [id, isAuthenticated, loading, navigate]);

  //Handle displayedAnswer changes
  useEffect(() => {
    if (allAnswers.length > 0) {
      setAnswers(allAnswers.slice(0, displayedAnswer));
    }
  }, [displayedAnswer, allAnswers, id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      setIsLoading(true);
      setError("");

      //Fetching questions and answers in parallel
      const [questionRes, answerRes] = await Promise.all([
        questionsAPI.getQuestionById(id),
        answersAPI.getAnswers(id),
      ]);

      //Setting question data
      if (questionRes.data.success) {
        setQuestionData(questionRes.data.question || {});

        // Record view for this question
        try {
          await questionsAPI.addView(id);
        } catch (viewErr) {
          console.error("Error recording view:", viewErr);
          // Don't fail the whole request if view recording fails
        }
      } else {
        setError("Questions Not Found");
        return;
      }

      //Setting answers data
      if (answerRes.data.success) {
        const fetchedAnswers = answerRes.data.answers || [];
        setAllAnswers(fetchedAnswers); //Storing All answers
        setAnswers(fetchedAnswers.slice(0, displayedAnswer) || []); //Displaying 4 Answers
      } else {
        setAllAnswers([]);
        setAnswers([]);
      }
    } catch (err) {
      console.error("Error fetching question:", err.message);

      if (err.response?.status === 404) {
        setError("Question not found");
      } else if (err.response?.status === 401) {
        setError("You need to be logged in to view this question");
        navigate("/auth");
      } else {
        setError("Failed to load content. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  //Handling More Answer
  const handleShowMore = () => {
    setDisplayedAnswer((prev) => prev + 4);
  };

  //Back To Questions(Home)
  const handleBackHome = () => {
    navigate("/");
  };

  // Loading state while auth is loading
  if (loading) {
    return (
      <div className={styles.questionDetail}>
        <div className={styles.loadingContainer}>
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.questionDetail}>
        <div className={styles.errorContainer}>
          <Alert variant="warning">
            You need to be logged in to view questions.
          </Alert>
          <Button onClick={() => navigate("/auth?mode=login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questionDetail}>
      {/* Question Detail Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Questions</h1>
        <Button
          variant="secondary"
          className={styles.backButton}
          onClick={handleBackHome}
        >
          <IoIosArrowRoundBack /> Back to Questions
        </Button>
      </div>

      {/* Question Section */}
      <section className={styles.postQuestion}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <Spinner className={styles.loading}>Loading question...</Spinner>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <Alert className={styles.error}>{error}</Alert>
            <Button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className={styles.questionContent}>
            <h2 className={styles.questionTitle}>
              <BsPatchQuestionFill /> {questionData.title}
            </h2>
            <div className={styles.questionMeta}>
              <span className={styles.questionAuthor}>
                Asked by: <strong>{questionData.username}</strong>
              </span>
              <span className={styles.questionDate}>
                {questionData.time &&
                  new Date(questionData.time).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </div>
            <p className={styles.questionDescription}>
              {questionData.question}
            </p>
            {questionData.tag && (
              <div className={styles.questionTags}>
                <span className={styles.tag}>#{questionData.tag}</span>
              </div>
            )}
          </div>
        )}
      </section>

      <hr className={styles.divider} />

      {/* Community Answers Section */}
      <section className={styles.communityAnswers}>
        <h2 className={styles.sectionTitle}>Answers From The Community</h2>
        <hr className={styles.hr} />

        {answers.length > 0 ? (
          <>
            {answers.map((answer, i) => (
              <div key={answer.answer_id || i} className={styles.answer}>
                <div className={styles.answerHeader}>
                  <FaUserCircle className={styles.answerIcon} size={50} />
                  <div className={styles.answerUserInfo}>
                    <span
                      className={`${styles.username} ${
                        answer.username === questionData.username
                          ? styles.questionAuthor
                          : ""
                      }`}
                    >
                      {answer.username}
                      {answer.username === questionData.username && (
                        <span className={styles.authorBadge}>
                          Question Author
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.answerText}>
                  <p>{answer.answer}</p>
                </div>
              </div>
            ))}

            {displayedAnswer < answers.length && (
              <Button
                className={styles.showMoreButton}
                onClick={handleShowMore}
              >
                Show More ({answers.length - displayedAnswer} remaining)
              </Button>
            )}
          </>
        ) : (
          <div className={styles.noAnswersContainer}>
            <p className={styles.noAnswers}>
              No answers yet. Be the first to answer this question!
            </p>
          </div>
        )}
      </section>

      {/* Post Answer Section */}
      <PostAnswer
        questionid={id}
        user={user}
        token={token}
        setAnswers={setAnswers}
        setAllAnswers={setAllAnswers}
      />
    </div>
  );
};

export default QuestionPage;
