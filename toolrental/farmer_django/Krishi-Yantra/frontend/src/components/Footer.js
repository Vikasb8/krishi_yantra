import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="app-footer">
      <Container>
        <Row className="align-items-center gy-3">
          <Col md={4} className="text-md-start text-center">
            <Link to="/" className="ky-footer-brand text-decoration-none">
              <i className="fas fa-seedling me-2" />
              <span className="fw-bold">Krishi-Yantra</span>
            </Link>
            <p className="ky-footer-tagline mb-0 mt-1">
              Rent farm equipment from nearby owners.
            </p>
          </Col>
          <Col md={4} className="text-center">
            <div className="ky-footer-links">
              <Link to="/browse" className="ky-footer-link">Browse</Link>
              <span className="ky-footer-divider">&middot;</span>
              <Link to="/login" className="ky-footer-link">Sign In</Link>
              <span className="ky-footer-divider">&middot;</span>
              <Link to="/register" className="ky-footer-link">Register</Link>
            </div>
          </Col>
          <Col md={4} className="text-md-end text-center small">
            <span className="text-muted">
              &copy; {new Date().getFullYear()} Krishi-Yantra. All rights reserved.
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
