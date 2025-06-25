import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle } from 'react-icons/fa';
import { MdCancel } from "react-icons/md";
import { authAPI } from '../../utils/api';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  

  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // State for real-time password validation
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

  // Checking if token is valid when page loads
  useEffect(() => {
    checkToken();
  }, [token]);

  // Calculating password strength as user types
  useEffect(() => {
    calculatePasswordStrength();
  }, [passwordValue]);

  // Checking if reset token is valid
  const checkToken = async () => {
    try {
      const response = await authAPI.verifyToken(token);
      
      if (response.data.success) {
        setTokenValid(true);
        setUserInfo(response.data.user);
        setMessage('Reset link is valid! Create your new password below.');
        setMessageType('success');
      } else {
        setMessage(response.data.error);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setMessage(error.response?.data?.error || 'Invalid or expired reset link');
      setMessageType('error');
    } finally {
      setVerifyingToken(false);
    }
  };

  // Calculating the password strength
  const calculatePasswordStrength = () => {
    let strength = 0;
    
    if (passwordValue.length >= 8) strength += 20;
    if (/[A-Z]/.test(passwordValue)) strength += 20;
    if (/[a-z]/.test(passwordValue)) strength += 20;
    if (/\d/.test(passwordValue)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) strength += 20;
    
    setPasswordStrength(strength);
  };

  // Handling password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    // Clear error message when user starts typing
    if (message && messageType === 'error') {
      setMessage('');
    }
  };

  // Handling confirm password input change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPasswordValue(value);
    // Clear error message when user starts typing
    if (message && messageType === 'error') {
      setMessage('');
    }
  };

  // Getting password strength color and text
  const getStrengthInfo = () => {
    if (passwordStrength < 40) return { color: 'danger', text: 'Weak' };
    if (passwordStrength < 80) return { color: 'warning', text: 'Medium' };
    return { color: 'success', text: 'Strong' };
  };

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    // validation
    if (!password) {
      setMessage('Please enter a new password');
      setMessageType('error');
      passwordRef.current.focus(); // Focus on error
      return;
    }

    if (!confirmPassword) {
      setMessage('Please confirm your password');
      setMessageType('error');
      confirmPasswordRef.current.focus(); // Focus on error
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      confirmPasswordRef.current.focus(); // Focus on error
      return;
    }

    if (passwordStrength < 80) {
      setMessage('Please choose a stronger password');
      setMessageType('error');
      passwordRef.current.focus(); // Focus on error
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Calling API to reset password
      const response = await authAPI.resetPassword(token, password, confirmPassword);

      if (response.data.success) {
        setResetSuccess(true);
        setMessage('🎉 Password reset successful! Redirecting to login...');
        setMessageType('success');
        
        // Redirecting to login after 3 seconds
        setTimeout(() => {
          navigate('/auth', { 
            state: { message: 'Password reset successful! Please log in with your new password.' }
          });
        }, 3000);
      } else {
        setMessage(response.data.error || 'Failed to reset password');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage(error.response?.data?.error || 'Something went wrong. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifyingToken) {
    return (
      <div className={styles.container}>
        <Container>
          <div className={styles.wrapper}>
            <Card className={styles.card}>
              <Card.Body className={styles.cardBody}>
                <div className={styles.loadingState}>
                  <Spinner animation="border" variant="primary" />
                  <p>Verifying reset link...</p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <Container>
          <div className={styles.wrapper}>
            <Card className={styles.card}>
              <Card.Body className={styles.cardBody}>
                <div className={styles.errorState}>
                  <div className={styles.errorIcon}><MdCancel /></div>
                  <h3>Invalid Reset Link</h3>
                  <p>{message}</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/forgot-password')}
                  >
                    Request New Reset Link
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.wrapper}>
          <Card className={styles.card}>
            <Card.Body className={styles.cardBody}>

              {/* Header */}
              <div className={styles.header}>
                {resetSuccess ? (
                  <FaCheckCircle className={styles.successIcon} />
                ) : (
                  <FaLock className={styles.lockIcon} />
                )}
                
                <h2 className={styles.title}>
                  {resetSuccess ? 'Password Reset!' : 'Create New Password'}
                </h2>
                
                {userInfo && (
                  <p className={styles.subtitle}>
                    Hi {userInfo.username}! Create a strong new password for your account.
                  </p>
                )}
              </div>

              {/* Message Alert */}
              {message && (
                <Alert variant={messageType === 'error' ? 'danger' : 'success'}>
                  {message}
                </Alert>
              )}

              {/* Password Reset Form */}
              {!resetSuccess && (
                <Form onSubmit={handleSubmit}>
                  
                  {/* New Password */}
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className={styles.passwordContainer}>
                      <Form.Control
                        ref={passwordRef} 
                        type={showPassword ? 'text' : 'password'}
                        onChange={handlePasswordChange}      //  real-time validation
                        placeholder="Enter new password"
                        disabled={loading}
                        className={styles.passwordInput}
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordValue && (
                      <div className={styles.strengthContainer}>
                        <ProgressBar 
                          now={passwordStrength} 
                          variant={getStrengthInfo().color}
                          className={styles.strengthBar}
                        />
                        <small className={`text-${getStrengthInfo().color}`}>
                          Password strength: {getStrengthInfo().text}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className={styles.passwordContainer}>
                      <Form.Control
                        ref={confirmPasswordRef} 
                        type={showConfirmPassword ? 'text' : 'password'}
                        onChange={handleConfirmPasswordChange}       // real-time validation
                        placeholder="Confirm new password"
                        disabled={loading}
                        className={styles.passwordInput}
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {confirmPasswordValue && (
                      <small className={passwordValue === confirmPasswordValue ? 'text-success' : 'text-danger'}>
                        {passwordValue === confirmPasswordValue ? 'Passwords match' : 'Passwords do not match'}
                      </small>
                    )}
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || passwordStrength < 80}
                    className={styles.submitBtn}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password '
                    )}
                  </Button>

                  {/* Password Requirements */}
                  <div className={styles.requirements}>
                    <h6>Password must contain:</h6>
                    <ul>
                      <li className={passwordValue.length >= 8 ? styles.met : ''}>
                        At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwordValue) ? styles.met : ''}>
                        One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(passwordValue) ? styles.met : ''}>
                        One lowercase letter
                      </li>
                      <li className={/\d/.test(passwordValue) ? styles.met : ''}>
                        One number
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) ? styles.met : ''}>
                        One special character
                      </li>
                    </ul>
                  </div>

                </Form>
              )}

            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;