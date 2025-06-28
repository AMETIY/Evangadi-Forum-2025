import React, { useRef, useState } from "react";
import styles from "./AskQuestionPage.module.css";
import { Alert, Spinner } from "react-bootstrap";
import { questionsAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";
import errorImage from "../../assets/images/externalpage.jpg";

const AskQuestionPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  const navigate = useNavigate();
  const { user } = useAuth();

  const titleRef = useRef();
  const questionRef = useRef();
  const descriptionRef = useRef();
  const tagRef = useRef();

  //Simple Message
  const showStatus = (message, type) => {
    setStatus({ message, type });

    //Auto clear Status after 5 secs
    setTimeout(() => {
      setStatus({ message: "", type: "" });
    }, 5000);
  };

  //Form Validation Function
  const validateForm = () => {
    const title = titleRef.current.value.trim();
    const question = questionRef.current.value.trim();
    const description = descriptionRef.current.value.trim();
    const tag = tagRef.current.value.trim();

    if (!title) {
      showStatus("Please enter a question title", "error");
      titleRef.current.focus();
      return false;
    }

    if (!question) {
      showStatus("Please enter your main question", "error");
      questionRef.current.focus();
      return false;
    }

    if (question.length > 255) {
      showStatus("Question must not exceed 255 character", "error");
      questionRef.current.focus();
      return false;
    }

    if (!description) {
      showStatus("Please provide a description", "error");
      descriptionRef.current.focus();
      return false;
    }

    return true;
  };

  //Handling Form Submission

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const questionData = {
        title: titleRef.current.value.trim(),
        question: questionRef.current.value.trim(),
        description: descriptionRef.current.value.trim(),
        tag: tagRef.current.value.trim(),
      };

      const response = await questionsAPI.postQuestion(questionData);

      if (response.data.success) {
        showStatus("Question Posted Successfully", "success");

        //clear From
        titleRef.current.value = "";
        questionRef.current.value = "";
        descriptionRef.current.value = "";
        tagRef.current.value = "javascript";

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });

        // After a short delay, navigate to home
        setTimeout(() => {
          navigate("/home");
        }, 2500);
      }
    } catch (err) {
      const errMessage =
        err.response.data?.error || "Failed to post question. Please try again";
      showStatus(errMessage, "error");
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  //Handling form reset
  const handleReset = () => {
    titleRef.current.value = "";
    questionRef.current.value = "";
    descriptionRef.current.value = "";
    tagRef.current.value = "javascript";
  };

  return (
    <div className={styles.askContainer}>
      <div className={styles.content}>
        {/* Guidelines Section */}
        <div className={styles.guidelines}>
          <h2>Steps to Write a Good Question</h2>
          <ul>
            <li>
              <FaCheckCircle /> Summarize your problem in a clear, descriptive
              title
            </li>
            <li>
              <FaCheckCircle /> Describe your problem in detail with context
            </li>
            <li>
              <FaCheckCircle /> Explain what you tried and what you expected to
              happen
            </li>
            <li>
              <FaCheckCircle /> Add relevant tags to help others find your
              question
            </li>
            <li>
              <FaCheckCircle /> Review your question before posting
            </li>
          </ul>
        </div>

        {/* Main Form Section */}
        <div className={styles.formSection}>
          <h1>Ask a Public Question</h1>
          <p className={styles.subtitle}>
            Welcome <strong>{user?.username || user?.first_name}</strong>! Share
            your coding question with the community.
          </p>

          {/* Message Display */}
          {status.message && (
            <>
              {status.type === "error" && (
                <img
                  src={errorImage}
                  alt="Error"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    margin: "0 auto 12px auto",
                    display: "block",
                    borderRadius: 12,
                  }}
                />
              )}
              <Alert variant={status.type === "error" ? "danger" : "success"}>
                {status.message}
              </Alert>
            </>
          )}

          {/* Question Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Title Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="title">
                Question Title <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                ref={titleRef}
                type="text"
                placeholder="e.g., How to implement pagination in React?"
                maxLength="100"
                disabled={isSubmitting}
                className={styles.input}
              />
              <small className={styles.hint}>Be specific</small>
            </div>

            {/* Main Question Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="question">
                What's your main question?{" "}
                <span className={styles.required}>*</span>
              </label>
              <textarea
                id="question"
                ref={questionRef}
                placeholder="State your main question clearly and concisely..."
                rows="3"
                maxLength="255"
                disabled={isSubmitting}
                className={styles.textarea}
              />
            </div>

            {/* Description Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="description">
                Detailed Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                ref={descriptionRef}
                placeholder="Provide more context, code snippets, error messages, what you've tried, etc..."
                rows="6"
                disabled={isSubmitting}
                className={styles.textarea}
              />
              <small className={styles.hint}>
                Include relevant code, error messages, and steps you've already
                taken
              </small>
            </div>

            {/* Tag Selection */}
            <div className={styles.fieldGroup}>
              <label htmlFor="tag">
                Primary Tag <span className={styles.optional}>(optional)</span>
              </label>
              <select
                id="tag"
                ref={tagRef}
                defaultValue="javascript"
                disabled={isSubmitting}
                className={styles.select}
              >
                <optgroup label="Programming Languages">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="c++">C++</option>
                  <option value="php">PHP</option>
                  <option value="go">Go</option>
                  <option value="typescript">TypeScript</option>
                  <option value="ruby">Ruby</option>
                  <option value="swift">Swift</option>
                </optgroup>
                <optgroup label="Frameworks & Libraries">
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="nodejs">Node.js</option>
                  <option value="express">Express.js</option>
                  <option value="nextjs">Next.js</option>
                  <option value="django">Django</option>
                  <option value="laravel">Laravel</option>
                </optgroup>
                <optgroup label="Databases & Tools">
                  <option value="mongodb">MongoDB</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="devops">DevOps</option>
                  <option value="git">Git</option>
                </optgroup>
              </select>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className={styles.resetBtn}
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className={styles.spinner}></Spinner>
                    Posting...
                  </>
                ) : (
                  "Post Your Question"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
