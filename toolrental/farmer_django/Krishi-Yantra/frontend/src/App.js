import Header from './components/Header';
import Footer from './components/Footer';
import { Container } from 'react-bootstrap';
import HomeScreen from './screens/HomeScreen';
import LandingScreen from './screens/LandingScreen';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ToolScreen from './screens/ToolScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddToolScreen from './screens/AddToolScreen';
import EditToolScreen from './screens/EditToolScreen';

/* Wrapper decides whether to use container or full-width layout */
function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {/* Hide navbar on landing page for immersive experience */}
      {!isLanding && <Header />}

      {isLanding ? (
        <main className="ky-landing-wrapper app-main">
          <Routes>
            <Route path="/" element={<LandingScreen />} />
          </Routes>
        </main>
      ) : (
        <main className="app-main py-4">
          <Container fluid="xxl" className="px-3 px-md-4">
            <Routes>
              <Route path="/browse" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/tools/:id" element={<ToolScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/add-tool" element={<AddToolScreen />} />
              <Route path="/edit-tool/:id" element={<EditToolScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
            </Routes>
          </Container>
        </main>
      )}

      {/* Show custom footer on landing page, standard footer elsewhere */}
      {isLanding ? <LandingFooter /> : <Footer />}
    </>
  );
}

/* Enhanced footer for landing page */
function LandingFooter() {
  return (
    <footer className="ky-landing-footer">
      <Container>
        <div className="ky-landing-footer-inner">
          <div className="ky-landing-footer-brand">
            <img
              src={`${process.env.PUBLIC_URL}/krishiyantralogo.png`}
              alt="Krishi-Yantra"
              className="ky-landing-footer-logo"
            />
            <p className="ky-landing-footer-tagline">
              Connecting farmers with the equipment they need.
            </p>
          </div>
          <div className="ky-landing-footer-links">
            <div className="ky-landing-footer-col">
              <h4>Platform</h4>
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How It Works</a>
              <a href="/browse">Browse Tools</a>
            </div>
            <div className="ky-landing-footer-col">
              <h4>Account</h4>
              <a href="/login">Sign In</a>
              <a href="/register">Create Account</a>
            </div>
          </div>
          <div className="ky-landing-footer-bottom">
            &copy; {new Date().getFullYear()} Krishi-Yantra. All rights reserved.
          </div>
        </div>
      </Container>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;