import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../api/apiClient';
import { timeAgo } from '../utils/dateFormat';

function ReviewList({ toolId, reviews = [], isLoading = false, currentUserId, onReviewDeleted }) {
  const [deleting, setDeleting] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeleting(reviewId);
    setFeedback(null);

    try {
      await apiClient.delete(`/api/reviews/${reviewId}/delete/`);
      setFeedback({ type: 'success', message: 'Review deleted successfully' });
      if (onReviewDeleted) onReviewDeleted(reviewId);
    } catch (error) {
      setFeedback({ type: 'danger', message: 'Failed to delete review' });
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" /> Loading reviews...
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-0 bg-light">
        <Card.Body className="text-center text-muted py-4">
          <i className="fas fa-comment-slash fa-2x mb-2 opacity-50" />
          <p className="mb-0">No reviews yet. Be the first to review this tool!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="reviews-list">
      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {reviews.map((review) => (
        <Card key={review.id} className="review-card mb-3 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <strong className="h6 mb-0">
                    {review.first_name || review.username}
                  </strong>
                  <span className="text-muted small">
                    ({review.username})
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i
                        key={i}
                        className={
                          review.rating >= i
                            ? 'fas fa-star'
                            : 'far fa-star'
                        }
                        style={{ color: '#ffc107' }}
                      />
                    ))}
                  </div>
                  <span className="text-muted small">
                    {timeAgo(new Date(review.createdAt))}
                  </span>
                </div>
              </div>
              {currentUserId === review.user_id && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0 ms-2"
                  onClick={() => handleDelete(review.id)}
                  disabled={deleting === review.id}
                >
                  {deleting === review.id ? (
                    <>
                      <Spinner size="sm" /> Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash" /> Delete
                    </>
                  )}
                </Button>
              )}
            </div>
            {review.comment && (
              <p className="mb-0 text-break">{review.comment}</p>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default ReviewList;
