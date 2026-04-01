import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import Tool from '../components/Tool';
import { listTools } from '../actions/toolActions';

function HomeScreen() {
  const dispatch = useDispatch();
  const toolList = useSelector((state) => state.toolList);
  const { error, loading, tools } = toolList;

  useEffect(() => {
    dispatch(listTools());
  }, [dispatch]);

  return (
    <div>
      <div className="page-hero">
        <h1>Rent agricultural tools</h1>
        <p className="lead">
          Find tractors, implements, and equipment near you—book dates and connect with owners in a few steps.
        </p>
      </div>

      {loading ? (
        <div className="ky-spinner-wrap">
          <Spinner animation="border" role="status" variant="primary" />
          <span>Loading tools…</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
          {error}
        </Alert>
      ) : (
        <Row className="g-4 ky-fade-in-stagger">
          {tools.map((tool) => (
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
