import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="app-footer">
      <Container>
        <Row className="align-items-center gy-2">
          <Col md={6} className="text-md-start footer-inner text-center">
            <span className="fw-semibold text-body-secondary">Krishi-Yantra</span>
            <span className="text-muted ms-2">Rent farm equipment from nearby owners.</span>
          </Col>
          <Col md={6} className="text-md-end text-center small">
            &copy; {new Date().getFullYear()} Krishi-Yantra. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
