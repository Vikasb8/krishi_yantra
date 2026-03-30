import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { listToolDetails } from '../actions/toolActions';
import { TOOL_DETAILS_RESET } from '../constants/toolConstants';
import Rating from '../components/Rating';
import apiClient from '../api/apiClient';
import { toLocalYmd } from '../utils/dateFormat';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function ToolScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toolDetails = useSelector((state) => state.toolDetails);
  const { loading, error, tool } = toolDetails;

  const [startDate, setStartDate] = useState(() => startOfToday());
  const [endDate, setEndDate] = useState(() => addDays(startOfToday(), 1));

  const [rangeCheck, setRangeCheck] = useState({ loading: false, ok: true });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const loginRedirectState = { from: `/tools/${id}` };

  useEffect(() => {
    if (!userInfo) {
      dispatch({ type: TOOL_DETAILS_RESET });
      return;
    }
    dispatch(listToolDetails(id));
  }, [dispatch, id, userInfo]);

  useEffect(() => {
    if (endDate <= startDate) {
      setEndDate(addDays(startDate, 1));
    }
    setBookingFeedback(null);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!tool?.id) return undefined;
    let cancelled = false;
    setRangeCheck((prev) => ({ ...prev, loading: true }));
    const s = toLocalYmd(startDate);
    const e = toLocalYmd(endDate);
    apiClient
      .get(`/api/tools/${tool.id}/`, { params: { start: s, end: e } })
      .then(({ data }) => {
        if (!cancelled) {
          setRangeCheck({
            loading: false,
            ok: data.can_book_selected_range === true,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRangeCheck({ loading: false, ok: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tool?.id, startDate, endDate]);

  const qty = tool?.quantity ?? 1;
  const available = tool?.available_units ?? 0;
  const globallyBookable = tool?.is_bookable !== false && available > 0;

  const rentalDays = useMemo(() => {
    const ms = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const estimatedTotal = useMemo(() => {
    if (!tool?.price_per_day) return 0;
    const rate = Number(tool.price_per_day);
    if (Number.isNaN(rate)) return 0;
    return rentalDays * rate;
  }, [tool?.price_per_day, rentalDays]);

  const bookingHandler = async () => {
    setBookingFeedback(null);
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setBookingSubmitting(true);
    try {
      const bookingData = {
        toolId: tool.id,
        startDate: toLocalYmd(startDate),
        endDate: toLocalYmd(endDate),
      };

      await apiClient.post('/api/bookings/create/', bookingData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setBookingFeedback({ variant: 'success', text: 'Request sent. The owner will review your dates.' });
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      const message =
        err.response && err.response.data.detail
          ? err.response.data.detail
          : 'Could not create booking.';
      setBookingFeedback({ variant: 'danger', text: message });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const todayStart = startOfToday();
  const endMin = addDays(startDate, 1);

  const bookDisabled =
    bookingSubmitting ||
    rangeCheck.loading ||
    !rangeCheck.ok ||
    !globallyBookable;

  const isOwner = userInfo && tool?.owner && userInfo.id === tool.owner;

  if (!userInfo) {
    return (
      <div className="tool-detail-page">
        <Link to="/" className="ky-back-nav">
          <span className="ky-back-nav-icon" aria-hidden>
            <i className="fas fa-arrow-left" />
          </span>
          <span className="ky-back-nav-text">Back to tools</span>
        </Link>

        <div className="auth-wrap py-2">
          <Card className="auth-card ky-tool-login-gate border-0">
            <Card.Body className="text-center py-4 px-3 px-sm-4">
              <div
                className="ky-tool-login-gate-icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded-3"
                aria-hidden
              >
                <i className="fas fa-lock" />
              </div>
              <h1 className="h4 mb-2 ky-tool-login-gate-title">Sign in to view this tool</h1>
              <p className="text-muted small mb-4">
                Log in to see full details, availability, and booking options for this listing.
              </p>
              <div className="ky-tool-login-gate-actions">
                <Button
                  as={Link}
                  to="/login"
                  state={loginRedirectState}
                  variant="primary"
                  className="ky-tool-login-gate-btn rounded-pill"
                >
                  Sign in
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  state={loginRedirectState}
                  variant="outline-primary"
                  className="ky-tool-login-gate-btn rounded-pill"
                >
                  Create account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-detail-page">
      <Link to="/" className="ky-back-nav">
        <span className="ky-back-nav-icon" aria-hidden>
          <i className="fas fa-arrow-left" />
        </span>
        <span className="ky-back-nav-text">Back to tools</span>
      </Link>

      {loading ? (
        <div className="ky-spinner-wrap">
          <Spinner animation="border" role="status" variant="primary" />
          <span>Loading tool…</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
          {error}
        </Alert>
      ) : (
        <Row className="g-4 align-items-start">
          <Col lg={6}>
            {tool.image ? (
              <img
                src={tool.image}
                alt={tool.name}
                className="img-fluid tool-detail-img w-100"
              />
            ) : (
              <div
                className="tool-detail-img tool-detail-img--placeholder d-flex align-items-center justify-content-center rounded-3"
                role="img"
                aria-label="No photo"
              >
                <i className="fas fa-tractor fa-3x opacity-50" aria-hidden />
              </div>
            )}
          </Col>

          <Col lg={6} className="tool-detail-panel">
            <Card className="ky-detail-card ky-detail-card--hero mb-3">
              <Card.Body>
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                  <h1 className="h3 mb-0">{tool.name}</h1>
                  {available > 0 ? (
                    <Badge bg="success" className="rounded-pill px-3 py-2">
                      {available} available
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="rounded-pill px-3 py-2">
                      Fully booked
                    </Badge>
                  )}
                </div>
                <div className="mb-3">
                  <Rating value={tool.rating || 0} color="#ca8a04" />
                </div>

                <h2 className="ky-section-title mb-0">
                  <i className="fas fa-list-ul" aria-hidden />
                  Quick facts
                </h2>
                <div className="ky-stat-grid">
                  <div className="ky-stat-pill">
                    <div className="ky-stat-label">In stock</div>
                    <div className="ky-stat-value">
                      {qty} unit{qty !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="ky-stat-pill">
                    <div className="ky-stat-label">Free (peak)</div>
                    <div className="ky-stat-value">{available}</div>
                  </div>
                  <div className="ky-stat-pill ky-stat-pill--price">
                    <div className="ky-stat-label">Per day</div>
                    <div className="ky-stat-value">₹{tool.price_per_day}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="ky-detail-card ky-about-card">
              <Card.Body>
                <h2 className="ky-section-title">
                  <i className="fas fa-info-circle" aria-hidden />
                  About this listing
                </h2>
                <p className="ky-about-text">{tool.description}</p>
                <div className="ky-about-meta text-muted small">
                  Overlapping bookings share your stock fairly—only when every unit is busy for
                  those dates will booking be blocked.
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={12}>
            {isOwner ? (
                <Alert variant="info" className="ky-booking-card text-center py-5 border-0 shadow-sm rounded-4 mb-0">
                    <i className="fas fa-info-circle fa-3x mb-3 text-info opacity-75" aria-hidden />
                    <h3 className="h4 mb-2">This is your listing</h3>
                    <p className="mb-0 text-muted">You cannot book your own equipment. Wait for renters to send booking requests.</p>
                </Alert>
            ) : (
            <Card className="ky-booking-card">
              <div className="ky-booking-head">
                <div className="ky-booking-head-icon" aria-hidden>
                  <i className="fas fa-calendar-alt" />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <h2>Book this equipment</h2>
                  <p className="text-muted">
                    Pick your rental window. The owner will confirm your request. Estimated total
                    updates as you change dates.
                  </p>
                </div>
              </div>
              <Card.Body>
                <div className="ky-booking-estimate">
                  <div>
                    <div className="ky-est-label">Estimated total</div>
                    <div className="ky-est-value">
                      ₹
                      {estimatedTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="text-md-end">
                    <div className="ky-est-label">Rental length</div>
                    <div className="fw-semibold text-body">
                      {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <p className="ky-est-hint mb-0">
                    ₹{tool.price_per_day} × {rentalDays} day{rentalDays !== 1 ? 's' : ''} (before
                    owner approval)
                  </p>
                </div>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <div className="ky-booking-field">
                      <label htmlFor="tool-start-date">Start date</label>
                      <DatePicker
                        id="tool-start-date"
                        selected={startDate}
                        onChange={(date) => date && setStartDate(date)}
                        className="form-control"
                        dateFormat="dd MMM yyyy"
                        wrapperClassName="w-100"
                        minDate={todayStart}
                      />
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="ky-booking-field">
                      <label htmlFor="tool-end-date">End date</label>
                      <DatePicker
                        id="tool-end-date"
                        selected={endDate}
                        onChange={(date) => date && setEndDate(date)}
                        className="form-control"
                        dateFormat="dd MMM yyyy"
                        wrapperClassName="w-100"
                        minDate={endMin}
                      />
                    </div>
                  </Col>
                </Row>

                {!rangeCheck.loading && !rangeCheck.ok && globallyBookable && (
                  <Alert variant="warning" className="mb-3 py-2 small rounded-3 border-0">
                    <i className="fas fa-exclamation-triangle me-2" aria-hidden />
                    Not enough free units for these dates. Try different dates.
                  </Alert>
                )}
                {!globallyBookable && (
                  <Alert variant="secondary" className="mb-3 py-2 small rounded-3 border-0">
                    <i className="fas fa-ban me-2" aria-hidden />
                    All units are currently reserved (pending or confirmed bookings).
                  </Alert>
                )}

                {bookingFeedback && (
                  <Alert
                    variant={bookingFeedback.variant}
                    className="mb-3 py-2 small rounded-3 border-0"
                    dismissible
                    onClose={() => setBookingFeedback(null)}
                  >
                    {bookingFeedback.text}
                  </Alert>
                )}

                <div className="d-grid gap-2">
                  <Button
                    onClick={bookingHandler}
                    variant="primary"
                    type="button"
                    disabled={bookDisabled}
                    className={`ky-book-now-btn ${
                      rangeCheck.loading ? 'ky-booking-submit--checking' : ''
                    } ${
                      globallyBookable &&
                      rangeCheck.ok &&
                      !rangeCheck.loading &&
                      !bookingSubmitting
                        ? 'ky-book-now-btn--stacked'
                        : ''
                    }`}
                    size="lg"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                          variant="light"
                          role="status"
                        />
                        Sending request…
                      </>
                    ) : rangeCheck.loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                          variant="light"
                          role="status"
                        />
                        Checking availability…
                      </>
                    ) : !globallyBookable || !rangeCheck.ok ? (
                      <>
                        <i className="fas fa-calendar-times me-2" aria-hidden />
                        Not available for these dates
                      </>
                    ) : (
                      <>
                        <span className="ky-book-now-btn__main">
                          <i className="fas fa-paper-plane me-2" aria-hidden />
                          Book now
                        </span>
                        <span className="ky-book-now-btn__sub d-block small fw-normal opacity-90">
                          Request rental · ₹
                          {estimatedTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{' '}
                          est.
                        </span>
                      </>
                    )}
                  </Button>
                  {globallyBookable && rangeCheck.ok && !rangeCheck.loading && !bookingSubmitting && (
                    <p className="text-muted small text-center mb-0">
                      {userInfo
                        ? 'The owner will confirm or decline your request.'
                        : 'Sign in to send a booking request.'}
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
}

export default ToolScreen;
