import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

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
        {qty > 1 && (
          <div className="text-muted small mb-1">{qty} units in stock</div>
        )}
        <div className="my-2">
          <Rating value={tool.condition_rating} color="#ca8a04" />
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
