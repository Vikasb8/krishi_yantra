import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../actions/userActions';

function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirectTo =
    typeof location.state?.from === 'string' ? location.state.from : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, userInfo, redirectTo]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      setMessage('');
      dispatch(register(name, email, phone, address, password));
    }
  };

  return (
    <div className="auth-wrap">
      <Card className="auth-card">
        <Card.Body>
          <h1 className="text-center">Create your account</h1>
          <p className="text-center text-muted small mb-4">
            Join to list tools or book equipment for your farm.
          </p>

          {message && (
            <Alert variant="danger" className="rounded-3 py-2 small">
              {message}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="rounded-3 py-2 small">
              {error}
            </Alert>
          )}
          {loading && (
            <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-2 mb-2">
              <Spinner animation="border" size="sm" role="status" />
              Creating account…
            </div>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                required
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={2}
                placeholder="Your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              Register
            </Button>
          </Form>

          <Row className="auth-footer-link">
            <Col>
              Already have an account?{' '}
              <Link to="/login" state={location.state}>Sign in</Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegisterScreen;
