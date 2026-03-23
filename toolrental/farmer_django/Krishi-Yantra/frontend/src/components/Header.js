import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { logout } from '../actions/userActions';

function Header() {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar
        expand="lg"
        collapseOnSelect
        sticky="top"
        className="ky-navbar py-2"
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center py-0">
              <span className="ky-navbar-logo-wrap">
                <img
                  src={`${process.env.PUBLIC_URL}/krishiyantralogo.png`}
                  alt="Krishi-Yantra"
                  className="ky-navbar-logo"
                />
              </span>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto align-items-lg-center flex-wrap gap-1 gap-lg-2 ky-navbar-nav">
              <LinkContainer to="/">
                <Nav.Link>
                  <i className="fas fa-tractor me-1" aria-hidden />
                  Browse tools
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <>
                  <LinkContainer to="/profile">
                    <Nav.Link>
                      <i className="fas fa-th-large me-1" aria-hidden />
                      Dashboard
                    </Nav.Link>
                  </LinkContainer>
                  <Nav.Link as="button" type="button" onClick={logoutHandler}>
                    <i className="fas fa-sign-out-alt me-1" aria-hidden />
                    Log out
                  </Nav.Link>
                  <Nav.Item className="d-flex align-items-center">
                    <span
                      className="nav-link py-2 mb-0 d-inline-flex align-items-center min-w-0"
                      style={{ cursor: 'default' }}
                      title={userInfo.email || userInfo.name || ''}
                    >
                      <i className="fas fa-user-circle me-1 flex-shrink-0" aria-hidden />
                      <span className="text-truncate">
                        {userInfo.name || userInfo.email || 'Signed in'}
                      </span>
                    </span>
                  </Nav.Item>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <i className="fas fa-sign-in-alt me-1" aria-hidden />
                      Sign in
                    </Nav.Link>
                  </LinkContainer>
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className="btn btn-primary text-white px-3 py-2 rounded-pill ms-lg-2 mt-2 mt-lg-0"
                  >
                    Create account
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
