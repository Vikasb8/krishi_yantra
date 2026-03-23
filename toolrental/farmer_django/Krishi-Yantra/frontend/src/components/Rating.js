import React from 'react';

const starClass = (value, threshold) => {
  if (value >= threshold) return 'fas fa-star';
  if (value >= threshold - 0.5) return 'fas fa-star-half-alt';
  return 'far fa-star';
};

function Rating({ value, text, color }) {
  return (
    <div className="condition_rating rating d-flex align-items-center flex-wrap gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>
          <i style={{ color }} className={starClass(value || 0, i)} aria-hidden />
        </span>
      ))}
      {text ? <span className="text-muted small ms-1">{text}</span> : null}
    </div>
  );
}

export default Rating;
