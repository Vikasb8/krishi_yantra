import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Modal,
} from 'react-bootstrap';
import { listMyBookings, listMyTools, listMyToolBookings } from '../actions/userActions';
import apiClient from '../api/apiClient';

function ProfileScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [profile, setProfile] = useState(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const myBookingsList = useSelector((state) => state.myBookingsList);
  const { loading: loadingBookings, error: errorBookings, bookings = [] } = myBookingsList;

  const myToolsList = useSelector((state) => state.myToolsList);
  const { loading: loadingTools, error: errorTools, tools = [] } = myToolsList;

  const myToolBookingsList = useSelector((state) => state.myToolBookingsList);
  const {
    loading: loadingToolBookings,
    error: errorToolBookings,
    bookings: toolBookings = [],
  } = myToolBookingsList;

  const pendingCount = useMemo(
    () => toolBookings.filter((b) => b.status === 'PENDING').length,
    [toolBookings]
  );

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(listMyBookings());
      dispatch(listMyTools());
      dispatch(listMyToolBookings());
    }
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    if (!userInfo) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get('/api/users/profile/');
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userInfo]);

  const displayName =
    (profile?.name && profile.name.trim()) ||
    userInfo?.name ||
    profile?.username ||
    userInfo?.email ||
    'Your account';
  const displayEmail = profile?.email || userInfo?.email || '';
  const displayUsername = profile?.username || userInfo?.email || '—';

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning' },
      CONFIRMED: { variant: 'success' },
      REJECTED: { variant: 'danger' },
      COMPLETED: { variant: 'info' },
      CANCELLED: { variant: 'secondary' },
    };

    const statusInfo = statusMap[status] || { variant: 'secondary' };

    return (
      <Badge bg={statusInfo.variant} className="ky-dashboard-badge">
        {status}
      </Badge>
    );
  };

  const handleConfirmAction = (bookingId, type) => {
    setSelectedBooking(bookingId);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleAction = async () => {
    if (!selectedBooking) return;

    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      await apiClient.put(`/api/bookings/${selectedBooking}/${endpoint}/`, {}, {
        headers: { 'Content-Type': 'application/json' },
      });
      dispatch(listMyToolBookings());
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const renderLoading = () => (
    <div className="ky-dashboard-loading">
      <Spinner animation="border" role="status" variant="primary" />
      <p className="mt-3 mb-0 text-muted">Loading…</p>
    </div>
  );

  const renderError = (error) => (
    <Alert variant="danger" className="ky-dashboard-alert border-0 rounded-3">
      {error}
    </Alert>
  );

  const renderEmptyState = (message, actionLabel, onAction) => (
    <div className="ky-dashboard-empty">
      <div className="ky-dashboard-empty-icon" aria-hidden>
        <i className="fas fa-inbox" />
      </div>
      <h4 className="h5 mb-2">{message}</h4>
      {onAction && (
        <Button
          variant="primary"
          size="sm"
          className="ky-dashboard-cta rounded-pill px-3 fw-semibold"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  return (
    <div className="profile-page ky-inner py-3 py-md-4">
      <header className="ky-dashboard-hero mb-3">
        <p className="ky-dashboard-eyebrow mb-1">Your workspace</p>
        <h1 className="ky-dashboard-title mb-2">Dashboard</h1>
        <p className="ky-dashboard-lead mb-0">
          Bookings you’ve made, tools you list, and requests from renters—in one place.
        </p>
      </header>

      <Card className="ky-dashboard-stat ky-dashboard-user-panel border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center g-3">
            <Col xs="auto">
              <div className="ky-dashboard-user-avatar" aria-hidden>
                <i className="fas fa-user" />
              </div>
            </Col>
            <Col className="min-w-0">
              <div className="ky-dashboard-user-label">Your account</div>
              <div className="ky-dashboard-user-name text-truncate">{displayName}</div>
              {displayEmail && displayEmail !== displayName ? (
                <div className="text-muted small text-truncate">{displayEmail}</div>
              ) : null}
              <div className="text-muted small">
                Username <span className="text-body">{displayUsername}</span>
              </div>
            </Col>
            <Col xs={12} sm="auto" className="ms-sm-auto d-flex">
              <Button
                variant="primary"
                size="sm"
                className="ky-dashboard-cta rounded-pill fw-semibold"
                onClick={() => navigate('/add-tool')}
              >
                <i className="fas fa-plus me-1" aria-hidden />
                List a tool
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4 ky-dashboard-stats">
        <Col xs={12} sm={4}>
          <Card className="ky-dashboard-stat border-0 h-100">
            <Card.Body>
              <div className="ky-dashboard-stat-icon ky-dashboard-stat-icon--bookings" aria-hidden>
                <i className="fas fa-calendar-check" />
              </div>
              <div className="ky-dashboard-stat-value">
                {loadingBookings ? '—' : bookings.length}
              </div>
              <div className="ky-dashboard-stat-label">Your bookings</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="ky-dashboard-stat border-0 h-100">
            <Card.Body>
              <div className="ky-dashboard-stat-icon ky-dashboard-stat-icon--tools" aria-hidden>
                <i className="fas fa-tractor" />
              </div>
              <div className="ky-dashboard-stat-value">
                {loadingTools ? '—' : tools.length}
              </div>
              <div className="ky-dashboard-stat-label">Listed tools</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="ky-dashboard-stat border-0 h-100">
            <Card.Body>
              <div className="ky-dashboard-stat-icon ky-dashboard-stat-icon--pending" aria-hidden>
                <i className="fas fa-bell" />
              </div>
              <div className="ky-dashboard-stat-value">
                {loadingToolBookings ? '—' : pendingCount}
              </div>
              <div className="ky-dashboard-stat-label">Pending requests</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="ky-dashboard-panel border-0">
        <Card.Body className="p-0">
          <Tabs
            defaultActiveKey="bookings"
            className="ky-dashboard-tabs px-3 px-md-4 pt-3"
            fill
          >
            <Tab eventKey="bookings" title="My bookings">
              <div className="ky-dashboard-tab-pane">
                {loadingBookings ? (
                  renderLoading()
                ) : errorBookings ? (
                  renderError(errorBookings)
                ) : bookings?.length === 0 ? (
                  renderEmptyState(
                    "You haven’t booked any equipment yet",
                    'Browse tools',
                    () => navigate('/')
                  )
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {bookings.map((booking) => (
                      <Col key={booking.id}>
                        <Card className="ky-dashboard-stat ky-dashboard-stat--detail h-100">
                          <Card.Body className="d-flex flex-column">
                            <div className="ky-dashboard-stat-head">
                              <div
                                className="ky-dashboard-stat-icon ky-dashboard-stat-icon--bookings ky-dashboard-stat-icon--inline"
                                aria-hidden
                              >
                                <i className="fas fa-calendar-check" />
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <h2 className="ky-dashboard-stat-title">{booking.tool?.name}</h2>
                            <div className="ky-dashboard-stat-meta">
                              <div>
                                <strong>From</strong>{' '}
                                {new Date(booking.start_date).toLocaleDateString()}
                              </div>
                              <div>
                                <strong>To</strong>{' '}
                                {new Date(booking.end_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="ky-dashboard-stat-footer">
                              <span className="ky-dashboard-stat-price">₹{booking.total_price}</span>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill"
                                onClick={() => navigate(`/tools/${booking.tool?.id}`)}
                              >
                                View tool
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>

            <Tab eventKey="tools" title="My tools">
              <div className="ky-dashboard-tab-pane">
                {loadingTools ? (
                  renderLoading()
                ) : errorTools ? (
                  renderError(errorTools)
                ) : tools?.length === 0 ? (
                  renderEmptyState(
                    'List your first tool to start earning',
                    'Add a tool',
                    () => navigate('/add-tool')
                  )
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {tools.map((tool) => (
                      <Col key={tool.id}>
                        <Card className="ky-dashboard-stat ky-dashboard-stat--detail h-100">
                          <Card.Body className="d-flex flex-column">
                            <div className="ky-dashboard-stat-head">
                              <div
                                className="ky-dashboard-stat-icon ky-dashboard-stat-icon--tools ky-dashboard-stat-icon--inline"
                                aria-hidden
                              >
                                <i className="fas fa-tractor" />
                              </div>
                              <Badge
                                bg={(tool.available_units ?? 0) > 0 ? 'success' : 'secondary'}
                                className="flex-shrink-0 rounded-pill"
                              >
                                {(tool.available_units ?? 0) > 0
                                  ? `${tool.available_units} free`
                                  : 'Fully booked'}
                              </Badge>
                            </div>
                            <h2 className="ky-dashboard-stat-title">{tool.name}</h2>
                            <div className="ky-dashboard-stat-meta">
                              <div>
                                <strong>In stock</strong> {tool.quantity ?? 1} unit
                                {(tool.quantity ?? 1) !== 1 ? 's' : ''}
                              </div>
                              <p className="mb-0 mt-2 small">
                                {tool.description?.substring(0, 100)}
                                {tool.description?.length > 100 ? '…' : ''}
                              </p>
                            </div>
                            <div className="ky-dashboard-stat-footer">
                              <div className="d-flex align-items-baseline gap-1 flex-wrap">
                                <span className="ky-dashboard-stat-price">₹{tool.price_per_day}</span>
                                <span className="text-muted small fw-semibold">/day</span>
                              </div>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="rounded-pill"
                                  onClick={() => navigate(`/edit-tool/${tool.id}`)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="rounded-pill"
                                  onClick={() => navigate(`/tools/${tool.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>

            <Tab
              eventKey="requests"
              title={
                <span className="ky-dashboard-tab-title">
                  Booking requests
                  {pendingCount > 0 && (
                    <Badge bg="danger" className="ms-2 rounded-pill">
                      {pendingCount}
                    </Badge>
                  )}
                </span>
              }
            >
              <div className="ky-dashboard-tab-pane">
                {loadingToolBookings ? (
                  renderLoading()
                ) : errorToolBookings ? (
                  renderError(errorToolBookings)
                ) : toolBookings?.length === 0 ? (
                  renderEmptyState('When renters request your tools, they’ll show up here.')
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {toolBookings.map((booking) => (
                      <Col key={booking.id}>
                        <Card className="ky-dashboard-stat ky-dashboard-stat--detail h-100">
                          <Card.Body className="d-flex flex-column">
                            <div className="ky-dashboard-stat-head">
                              <div
                                className="ky-dashboard-stat-icon ky-dashboard-stat-icon--pending ky-dashboard-stat-icon--inline"
                                aria-hidden
                              >
                                <i className="fas fa-bell" />
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <h2 className="ky-dashboard-stat-title">{booking.tool?.name}</h2>
                            <div className="ky-dashboard-stat-meta">
                              <div>
                                <strong>Renter</strong> {booking.renter?.username || '—'}
                              </div>
                              <div className="mt-2">
                                <strong>Dates</strong>{' '}
                                {new Date(booking.start_date).toLocaleDateString()} →{' '}
                                {new Date(booking.end_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="ky-dashboard-stat-footer flex-column align-items-stretch">
                              {booking.status === 'PENDING' ? (
                                <div className="d-flex flex-wrap gap-2 justify-content-end">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    className="rounded-pill flex-grow-1 flex-sm-grow-0"
                                    onClick={() => handleConfirmAction(booking.id, 'approve')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="rounded-pill flex-grow-1 flex-sm-grow-0"
                                    onClick={() => handleConfirmAction(booking.id, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="rounded-pill align-self-end"
                                  onClick={() => navigate(`/tools/${booking.tool?.id}`)}
                                >
                                  View tool
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            Confirm {actionType === 'approve' ? 'approval' : 'rejection'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {actionType} this booking request?
          {actionType === 'reject' && (
            <div className="mt-3">
              <label className="form-label small text-muted" htmlFor="reject-reason">
                Reason (optional)
              </label>
              <textarea
                id="reject-reason"
                className="form-control rounded-3"
                rows={3}
                placeholder="Optional note for yourself"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            className="rounded-3 fw-semibold"
            onClick={handleAction}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'} booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProfileScreen;
