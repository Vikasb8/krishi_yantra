import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import RatingBadge from './RatingBadge';

function Tool({ tool }) {
  const qty = tool.quantity ?? 1;
  const available = tool.available_units ?? 0;
  const fullyBooked = available <= 0;

  return (
    <Card className="ky-card-tool h-100">
      <Link to={`/tools/${tool.id}`} className="text-decoration-none">
        <Card.Img
          src={tool.image}
          variant="top"
          alt={tool.name || 'Tool'}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <Link to={`/tools/${tool.id}`} className="text-decoration-none flex-grow-1">
            <Card.Title as="h2" className="h5 mb-0">
              {tool.name}
            </Card.Title>
          </Link>
          {fullyBooked ? (
            <Badge bg="secondary" className="flex-shrink-0">
              Fully booked
            </Badge>
          ) : (
            <Badge bg="success" className="flex-shrink-0">
              {available} left
            </Badge>
          )}
        </div>
        {tool.owner_details && (
          <div className="ky-card-owner">
            <i className="fas fa-user-circle" />
            <span>
              by{' '}
              <strong>{tool.owner_details.name || tool.owner_details.username || 'Owner'}</strong>
            </span>
            {tool.owner_details.location && (
              <>
                <span className="ky-card-owner-dot">&middot;</span>
                <span className="ky-card-owner-loc">
                  <i className="fas fa-map-marker-alt" />
                  {tool.owner_details.location}
                </span>
              </>
            )}
          </div>
        )}
        {qty > 1 && (
          <div className="text-muted small mb-1">{qty} units in stock</div>
        )}
        <div className="my-2 d-flex align-items-center gap-2">
          <Rating value={tool.average_rating || 0} color="#ca8a04" />
          {tool.review_count > 0 ? (
            <RatingBadge 
              averageRating={tool.average_rating} 
              reviewCount={tool.review_count || 0} 
            />
          ) : (
            <span className="small text-muted">No reviews yet</span>
          )}
        </div>
        <div className="mt-auto pt-2 d-flex align-items-baseline justify-content-between">
          <span className="price-tag">₹{tool.price_per_day}</span>
          <span className="text-muted small">per day</span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Tool;
