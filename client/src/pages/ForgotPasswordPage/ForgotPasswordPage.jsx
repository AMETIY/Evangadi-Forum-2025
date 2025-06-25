import React, { useState, useRef } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCheckCircle, FaInbox, FaMouse } from 'react-icons/fa';
import { authAPI } from '../../utils/api';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  
  const emailRef = useRef();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(''); // Store email for success message

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    const email = emailRef.current.value.trim();
    
    // validation
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      emailRef.current.focus(); //Focus on error
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      emailRef.current.focus();
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Calling API to request password reset
      const response = await authAPI.requestReset(email);

      if (response.data.success) {
        setEmailSent(true);
        setSubmittedEmail(email); // Store email for success message
        setMessage(response.data.message);
        setMessageType('success');
      } else {
        setMessage(response.data.error || 'Something went wrong');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage(error.response?.data?.error || 'Something went wrong. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Handling sending another email
  const handleSendAnother = () => {
    setEmailSent(false);
    setMessage('');
    setSubmittedEmail('');
       
    // ensuring the form is rendered before trying to access the ref
    setTimeout(() => {
      if (emailRef.current) {
        emailRef.current.value = ''; // Clear ref value
        emailRef.current.focus(); // Focus on input
      }
    }, 0);
  };

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.wrapper}>
          <Card className={styles.card}>
            <Card.Body className={styles.cardBody}>
              
              {/* Back to Login Link */}
              <Link to="/auth" className={styles.backLink}>
                <FaArrowLeft className="me-2" />
                Back to Login
              </Link>

              {/* Icon and Title */}
              <div className={styles.header}>
                {emailSent ? (
                  <FaCheckCircle className={styles.successIcon} />
                ) : (
                  <FaEnvelope className={styles.emailIcon} />
                )}
                
                <h2 className={styles.title}>
                  {emailSent ? 'Check Your Email! ' : 'Forgot Password?'}
                </h2>
                
                <p className={styles.subtitle}>
                  {emailSent 
                    ? `We sent a reset link to ${submittedEmail}. Check your inbox!`
                    : "No worries! Just enter your email and we'll send you a reset link."
                  }
                </p>
              </div>

              {/* Message Alert */}
              {message && (
                <Alert variant={messageType === 'error' ? 'danger' : 'success'}>
                  {message}
                </Alert>
              )}

              {/* Form or Success Message */}
              {!emailSent ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      ref={emailRef} 
                      type="email"
                      placeholder="Enter your email address"
                      disabled={loading}
                      autoFocus
                      className={styles.emailInput}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link '
                    )}
                  </Button>
                </Form>
              ) : (
                <div className={styles.successMessage}>
                  <div className={styles.instructions}>
                    <h5>What to do next:</h5>
                    <ul>
                      <li> <FaInbox /> Check your email inbox</li>
                      <li>Look for email from Evangadi Forum</li>
                      <li><FaMouse /> Click the "Reset Password" button</li>
                      <li>Link expires in 30 minutes</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline-primary"
                    onClick={handleSendAnother} 
                    className={styles.sendAnotherBtn}
                  >
                    Send Another Email
                  </Button>
                </div>
              )}

              {/* Footer */}
              <div className={styles.footer}>
                <p>
                  Remember your password?{' '}
                  <Link to="/auth" className={styles.loginLink}>
                    Back to Login
                  </Link>
                </p>
              </div>

            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;