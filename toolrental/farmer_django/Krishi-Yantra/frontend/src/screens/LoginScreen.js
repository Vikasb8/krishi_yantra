import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../actions/userActions';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirectTo =
    typeof location.state?.from === 'string' ? location.state.from : '/browse';

  useEffect(() => {
    if (userInfo) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, userInfo, redirectTo]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <div className="auth-wrap">
      <Card className="auth-card">
        <Card.Body>
          <h1 className="text-center">Welcome back</h1>
          <p className="text-center text-muted small mb-4">
            Sign in to book tools and manage your dashboard.
          </p>

          {error && (
            <Alert variant="danger" className="rounded-3 py-2 small">
              {error}
            </Alert>
          )}
          {loading && (
            <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-2 mb-2">
              <Spinner animation="border" size="sm" role="status" />
              Signing you in…
            </div>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              <i className="fas fa-sign-in-alt me-2" aria-hidden />
              Sign in
            </Button>
          </Form>

          <Row className="auth-footer-link">
            <Col>
              New here?{' '}
              <Link to="/register" state={location.state}>Create an account</Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginScreen;
