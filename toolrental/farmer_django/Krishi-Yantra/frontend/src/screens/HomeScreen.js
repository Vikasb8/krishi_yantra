import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Tool from '../components/Tool';
import { listTools } from '../actions/toolActions';

function HomeScreen() {
  const dispatch = useDispatch();
  const toolList = useSelector((state) => state.toolList);
  const { error, loading, tools } = toolList;
  const [searchTerm, setSearchTerm] = useState('');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(listTools());
  }, [dispatch]);

  const filteredTools = tools
    ? tools.filter(
        (tool) =>
          tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="ky-browse-page">
      {/* Enhanced browse hero */}
      <div className="ky-browse-hero">
        <div className="ky-browse-hero-content">
          <div className="ky-browse-hero-badge">
            <i className="fas fa-tractor" />
            <span>Equipment Marketplace</span>
          </div>
          <h1 className="ky-browse-hero-title">
            Browse Agricultural Equipment
          </h1>
          <p className="ky-browse-hero-subtitle">
            Find tractors, implements, and equipment near you &mdash; book dates and connect with owners in a few steps.
          </p>
        </div>

        {/* Search bar */}
        <div className="ky-browse-search-wrap">
          <div className="ky-browse-search">
            <i className="fas fa-search ky-browse-search-icon" />
            <Form.Control
              type="text"
              placeholder="Search tools by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ky-browse-search-input"
              id="browse-search"
            />
            {searchTerm && (
              <button
                className="ky-browse-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                type="button"
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="ky-browse-stats">
          <div className="ky-browse-stat-item">
            <i className="fas fa-tools" />
            <span>{tools ? tools.length : 0} tools available</span>
          </div>
          <div className="ky-browse-stat-item">
            <i className="fas fa-filter" />
            <span>{filteredTools.length} shown</span>
          </div>
          {userInfo && (
            <Link to="/add-tool" className="ky-browse-stat-item ky-browse-stat-item--cta">
              <i className="fas fa-plus-circle" />
              <span>List your tool</span>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="ky-spinner-wrap">
          <Spinner animation="border" role="status" variant="primary" />
          <span>Loading tools...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
          {error}
        </Alert>
      ) : filteredTools.length === 0 ? (
        <div className="ky-browse-empty">
          <div className="ky-browse-empty-icon">
            <i className="fas fa-search" />
          </div>
          <h3>No tools found</h3>
          <p>
            {searchTerm
              ? `No results for "${searchTerm}". Try a different search term.`
              : 'No tools are currently listed. Be the first to list one!'}
          </p>
          {searchTerm && (
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => setSearchTerm('')}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <Row className="g-4 ky-fade-in-stagger">
          {filteredTools.map((tool) => (
            <Col key={tool.id} xs={12} sm={6} lg={4} xl={3}>
              <div className="ky-fade-in">
                <Tool tool={tool} />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default HomeScreen;
