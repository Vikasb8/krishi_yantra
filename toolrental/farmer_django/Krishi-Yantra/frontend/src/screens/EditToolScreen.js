import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap';
import apiClient from '../api/apiClient';

function EditToolScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/tools/${id}/`);
        if (cancelled) return;
        setName(data.name || '');
        setCategory(data.category || '');
        setDescription(data.description || '');
        setPricePerDay(String(data.price_per_day ?? ''));
        setQuantity(String(data.quantity ?? 1));
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.detail || e.message || 'Failed to load tool.');
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    const qty = parseInt(quantity, 10);
    if (!name.trim() || !category.trim() || !description.trim()) {
      setError('Please fill in name, category, and description.');
      return;
    }
    if (Number.isNaN(qty) || qty < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    const price = parseFloat(pricePerDay, 10);
    if (Number.isNaN(price) || price < 0) {
      setError('Enter a valid price per day.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('category', category.trim());
    formData.append('description', description.trim());
    formData.append('price_per_day', String(price));
    formData.append('quantity', String(qty));
    if (image) {
      formData.append('image', image);
    }

    setLoading(true);
    try {
      await apiClient.patch(`/api/tools/${id}/update/`, formData);
      navigate('/profile');
    } catch (err) {
      const msg =
        err.response?.data &&
        (typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.detail ||
            JSON.stringify(err.response.data));
      setError(msg || err.message || 'Could not update listing.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return null;
  }

  if (fetching) {
    return (
      <div className="ky-spinner-wrap">
        <Spinner animation="border" variant="primary" />
        <span>Loading listing…</span>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <Card className="auth-card" style={{ maxWidth: 520 }}>
        <Card.Body>
          <h1 className="h3 mb-2">Edit listing</h1>

          {error && (
            <Alert variant="danger" className="rounded-3 py-2 small">
              {error}
            </Alert>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="edit-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-desc">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-price">
              <Form.Label>Price per day (₹)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-qty">
              <Form.Label>Quantity (units in stock)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="edit-image">
              <Form.Label>New photo (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </Form.Group>
            <div className="d-flex gap-2 flex-wrap">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EditToolScreen;
