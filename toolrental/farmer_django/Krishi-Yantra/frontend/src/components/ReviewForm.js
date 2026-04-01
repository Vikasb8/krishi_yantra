import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import apiClient from '../api/apiClient';

function ReviewForm({ toolId, onSubmitSuccess, isLoading = false }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const response = await apiClient.post('/api/reviews/create/', {
        toolId,
        rating: parseInt(rating),
        comment,
      });

      setFeedback({ type: 'success', message: 'Review submitted successfully!' });
      setRating(5);
      setComment('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to submit review';
      setFeedback({ type: 'danger', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="review-form-card mb-4">
      <Card.Body>
        <h5 className="mb-3">Share your review</h5>

        {feedback && (
          <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Rating</Form.Label>
            <div className="rating-input-group d-flex gap-2 align-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${parseInt(rating) >= star ? 'selected' : ''}`}
                  onClick={() => setRating(star)}
                  title={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <i className="fas fa-star" />
                </button>
              ))}
              <span className="ms-2 text-muted">{rating}/5</span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Your comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share your experience with this tool..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              disabled={submitting || isLoading}
            />
            <Form.Text className="text-muted">
              {comment.length}/500 characters
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={submitting || isLoading}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReviewForm;
