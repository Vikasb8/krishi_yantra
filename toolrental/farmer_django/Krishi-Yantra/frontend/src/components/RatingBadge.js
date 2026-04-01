import React from 'react';
import { Badge } from 'react-bootstrap';
import './RatingBadge.css';

function RatingBadge({ averageRating = 0, reviewCount = 0, onClick }) {
  if (reviewCount === 0 && averageRating === 0) {
    return (
      <Badge bg="light" text="muted" className="rating-badge">
        <i className="fas fa-star" /> No reviews yet
      </Badge>
    );
  }

  return (
    <Badge
      bg="light"
      text="dark"
      className="rating-badge clickable"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <i className="fas fa-star" style={{ color: '#ffc107' }} /> {averageRating}
      <span className="ms-1">({reviewCount})</span>
    </Badge>
  );
}

export default RatingBadge;
