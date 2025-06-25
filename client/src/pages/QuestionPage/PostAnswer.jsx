import React, { use, useState } from 'react'
import styles from './PostAnswer.module.css'
import { Alert, Button, Spinner } from 'react-bootstrap';
import { answersAPI } from '../../utils/api';

const PostAnswer = ({questionid, user, setAnswers, setAllAnswers}) => {

  const [newAnswer, setNewAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  //Clearing messages after 5 secs
  const clearMessages = () => {

    setTimeout(() => {
      setError('');
      setSuccess('');
  }, 5000);

  }

  // Form validation
  const validateAnswer = () => {
    const trimmedAnswer = newAnswer.trim();
    
    if (trimmedAnswer.length < 10) {
      setError('Answer must be at least 10 characters long.');
      return false;
    }

    if (trimmedAnswer.length > 5000) {
      setError('Answer must be less than 5000 characters.');
      return false;
    }

    return true;
  };


  //
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

     // Input Validation
    if (!validateAnswer()) {
      clearMessages();
      return;
    }
    

    try{

      setIsSubmitting(true);


      //Our ANSWER DATA 
      const answerData = {
        question_id: questionid,
        answer: newAnswer.trim(),
        userId: user?.user_id
      };

      const response= await answersAPI.postAnswer(answerData);

      if (response.data.success) {

        //Now We can Add a New Answer to the list
        const newAnswerData = {
          answer_id: response.data?.answer_id || Date.now(),
          answer: newAnswer.trim(),
          username: user?.username || user?.first_name || 'Anonymous',
          time: new Date().toISOString(),
          user_id: user?.user_id || user?.id || user?.userid
        }

        setAnswers(prev => [newAnswerData, ...prev]);   //displaying new answers at the top,  prepending instead of append
        setAllAnswers(prev => [newAnswerData, ...prev])
        setNewAnswer('');
        setSuccess('Answer Posted Successful');
        clearMessages();

      }else{
        setError(response?.data?.error || 'Failed to post answer. Please try again later.');
        clearMessages();

      }


    }catch (err){
      console.error('Error Submitting Your answer:', err);
      setError(err.response?.data?.error || 'Failed to post answer. Please try again later.');
      clearMessages();

    }finally{
      setIsSubmitting(false);

    }


  }




  return (
    <section className={styles.postAnswerSection}>
      <h2 className={styles.title}>Answer The Top Question</h2>
      
      {/* Status Messages */}
      {error && (
        <Alert variant="danger" className={styles.statusMessage}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className={styles.statusMessage}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmitAnswer} className={styles.answerForm}>
        <div className={styles.formGroup}>
          <label htmlFor="answer" className={styles.label}>
            Your Answer
          </label>
          <textarea
            id="answer"
            className={styles.textarea}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Provide a detailed answer to help the community..."
            disabled={isSubmitting}
            rows="6"
          />
          <div className={styles.characterCount}>
            <small className={styles.helperText}>
              {newAnswer.length}/2000 characters (minimum 10 required)
            </small>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || newAnswer.trim().length < 10}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className={styles.spinner} />
                {/* Posting Answer... */}
              </>
            ) : (
              'Post Your Answer'
            )}
          </Button>
          
          {newAnswer && (
            <Button
              type="button"
              className={styles.clearButton}
              onClick={() => setNewAnswer('')}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      <div className={styles.formFooter}>
        <p className={styles.footerText}>
          By posting your answer, you agree to help the community and follow our guidelines.
        </p>
      </div>
    </section>
  )
}

export default PostAnswer