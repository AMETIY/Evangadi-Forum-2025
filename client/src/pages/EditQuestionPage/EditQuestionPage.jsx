import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRef } from "react";
import { questionsAPI } from "../../utils/api";
import { useEffect } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { MdCancel } from "react-icons/md";
import styles from "./EditQuestionPage.module.css";

const EditQuestionPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // useRef for form inputs
  const titleRef = useRef();
  const questionRef = useRef();
  const descriptionRef = useRef();
  const tagRef = useRef();

  //Tag Options
  const tagOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
    { value: "database", label: "Database" },
    { value: "sql", label: "SQL" },
    { value: "mongodb", label: "MongoDB" },
    { value: "api", label: "API" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "fullstack", label: "Full Stack" },
    { value: "mobile", label: "Mobile Development" },
    { value: "android", label: "Android" },
    { value: "ios", label: "iOS" },
    { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" },
    { value: "php", label: "PHP" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "git", label: "Git" },
    { value: "devops", label: "DevOps" },
    { value: "aws", label: "AWS" },
    { value: "docker", label: "Docker" },
    { value: "testing", label: "Testing" },
    { value: "debugging", label: "Debugging" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
    { value: "ui-ux", label: "UI/UX" },
    { value: "algorithms", label: "Algorithms" },
    { value: "data-structures", label: "Data Structures" },
    { value: "career", label: "Career" },
    { value: "general", label: "General" },
    { value: "other", label: "Other" },
  ];

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await questionsAPI.getQuestionById(id);

      if (response.data.success) {
        const question = response.data.question;

        // Check if current user is the owner
        if (user.user_id !== question.user_id) {
          setError("You can only edit your own questions");
          return;
        }

        // Populating form fields using refs
        titleRef.current.value = question.title || "";
        questionRef.current.value = question.question || "";
        descriptionRef.current.value = question.description || "";
        tagRef.current.value = question.tag || "";
      } else {
        setError(response.data.error || "Failed to fetch question");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  //handling submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    //Getting Values from refs

    const updatedData = {
      title: titleRef.current.value.trim(),
      question: questionRef.current.value.trim(),
      description: descriptionRef.current.value.trim(),
      tag: tagRef.current.value.trim(),
    };

    // validation
    if (
      !updatedData.title ||
      !updatedData.question ||
      !updatedData.description
    ) {
      setError("Please fill in all required fields");
      // Focus on the first empty field
      if (!updatedData.title) {
        titleRef.current.focus();
      } else if (!updatedData.question) {
        questionRef.current.focus();
      } else if (!updatedData.description) {
        descriptionRef.current.focus();
      }
      return;
    }

    // Length validation
    if (updatedData.title.length > 100) {
      setError("Title must not exceed 100 characters");
      titleRef.current.focus();
      return;
    }

    if (updatedData.question.length > 100) {
      setError("Question must not exceed 100 characters");
      questionRef.current.focus();
      return;
    }
    if (updatedData.description.length > 255) {
      setError("Description must not exceed 255 characters");
      questionRef.current.focus();
      return;
    }

    if (updatedData.tag.length > 100) {
      setError("Tag must not exceed 100 characters");
      tagRef.current.focus();
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await questionsAPI.updateQuestion(id, updatedData);

      if (response.data.success) {
        setSuccess("Question Updated Successfully");
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
        // After a short delay, navigate to home
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }

    const handleCancel = () => {
      navigate(`/question/${id}`);
    };
  };

  const handleCancel = () => {
    navigate(`/question/${id}`);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className={`py-4 ${styles.edit}`}>
      <Card>
        <Card.Header>
          <h2>Edit Question</h2>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                ref={titleRef}
                placeholder="Enter a Descriptive Title For Your Question"
                maxLength={100}
              />
              <Form.Text className="text-muted">max. 100 characters</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                ref={questionRef}
                placeholder="What is Your Question"
                maxLength={100}
              />
              <Form.Text className="text-muted">max. 100 characters</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                type="text"
                ref={descriptionRef}
                placeholder="Provide a Details About Your Question For Clarity"
                maxLength={255}
              />
              <Form.Text className="text-muted">max. 100 characters</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tag</Form.Label>
              <Form.Select
                ref={tagRef}
                aria-label="Select a Tag For Your Questions"
              >
                {tagOptions.map((option) => (
                  <option key={option.value} value={option.va}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Choose a category that best describes your question
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                type="submit"
                variant="outline-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    updating...
                  </>
                ) : (
                  "Update Question"
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                <MdCancel />
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditQuestionPage;
