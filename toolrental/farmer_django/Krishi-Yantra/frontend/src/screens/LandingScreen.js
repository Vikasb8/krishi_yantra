import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import './LandingScreen.css';

/* Intersection-observer hook for reveal-on-scroll */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* Animated counter */
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const [counterRef, counterVisible] = useReveal(0.3);

  useEffect(() => {
    if (!counterVisible) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [counterVisible, end, duration]);

  return (
    <span ref={counterRef}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* Floating particles background */
function FloatingParticles() {
  return (
    <div className="ky-particles" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`ky-particle ky-particle--${i + 1}`} />
      ))}
    </div>
  );
}

/* Main Landing Screen */
function LandingScreen() {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [heroRef, heroVisible] = useReveal(0.1);
  const [featRef, featVisible] = useReveal(0.12);
  const [howRef, howVisible] = useReveal(0.12);
  const [statsRef, statsVisible] = useReveal(0.15);
  const [testimRef, testimVisible] = useReveal(0.12);
  const [ctaRef, ctaVisible] = useReveal(0.15);

  /* Parallax on hero image */
  const [scrollY, setScrollY] = useState(0);
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const features = [
    {
      icon: 'fas fa-search',
      title: 'Discover Equipment',
      desc: 'Browse tractors, tillers, harvesters, and more from verified owners in your area.',
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Instant Booking',
      desc: 'Select your dates, choose quantity, and send a booking request in seconds.',
    },
    {
      icon: 'fas fa-star',
      title: 'Trusted Reviews',
      desc: "Real ratings from farmers who've used the equipment. Book with confidence.",
    },
    {
      icon: 'fas fa-rupee-sign',
      title: 'Affordable Pricing',
      desc: 'Transparent per-day pricing. No hidden fees. Pay only for what you use.',
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure & Reliable',
      desc: 'Every booking is owner-confirmed. Your equipment, your schedule, your terms.',
    },
    {
      icon: 'fas fa-users',
      title: 'Community Driven',
      desc: 'Join thousands of farmers sharing resources and building stronger communities.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create Your Account',
      desc: "Sign up in under a minute. It's free for all farmers.",
      icon: 'fas fa-user-plus',
    },
    {
      num: '02',
      title: 'Browse & Select',
      desc: 'Find the right equipment near you with filters for type, price, and availability.',
      icon: 'fas fa-tractor',
    },
    {
      num: '03',
      title: 'Book & Confirm',
      desc: 'Pick your dates, request a booking, and get owner confirmation quickly.',
      icon: 'fas fa-handshake',
    },
    {
      num: '04',
      title: 'Use & Review',
      desc: 'Pick up the equipment, use it, and share your experience with a review.',
      icon: 'fas fa-award',
    },
  ];

  const rupee = '\u20B9';

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Madhya Pradesh',
      text: "Krishi-Yantra helped me rent a tractor during the peak sowing season when buying wasn't an option. Saved me " + rupee + "2 lakhs!",
      avatar: 'RK',
    },
    {
      name: 'Sunita Devi',
      location: 'Uttar Pradesh',
      text: "I list my husband's harvester on Krishi-Yantra when we don't need it. The extra income has been a blessing for our family.",
      avatar: 'SD',
    },
    {
      name: 'Anil Patil',
      location: 'Maharashtra',
      text: 'The booking process is so simple. I found a rotavator 5km away and booked it in 2 minutes. Amazing platform!',
      avatar: 'AP',
    },
  ];

  return (
    <div className="ky-landing">
      {/* HERO */}
      <section
        ref={heroRef}
        className={`ky-hero ${heroVisible ? 'ky-reveal' : ''}`}
      >
        <FloatingParticles />
        <div className="ky-hero-gradient" />
        <Container className="ky-hero-inner">
          <Row className="align-items-center gy-4">
            <Col lg={6} className="ky-hero-text-col">
              <div className="ky-hero-badge">
                <i className="fas fa-seedling" />
                <span>{"India's #1 Farm Equipment Marketplace"}</span>
              </div>
              <h1 className="ky-hero-title">
                Rent Farm Equipment
                <span className="ky-hero-title-accent"> Near You</span>
              </h1>
              <p className="ky-hero-subtitle">
                Access tractors, tillers, harvesters, and more &mdash; from local
                farmers who have what you need, when you need it. Save money,
                save time, grow more.
              </p>
              <div className="ky-hero-actions">
                {userInfo ? (
                  <Link to="/browse" className="btn ky-btn-primary ky-btn-lg">
                    <i className="fas fa-tractor me-2" />
                    Browse Equipment
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn ky-btn-primary ky-btn-lg"
                    >
                      Get Started Free
                      <i className="fas fa-arrow-right ms-2" />
                    </Link>
                    <Link
                      to="/login"
                      className="btn ky-btn-outline ky-btn-lg"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="ky-hero-trust">
                <div className="ky-hero-trust-avatars">
                  {['R', 'S', 'A', 'P'].map((letter, i) => (
                    <div key={i} className="ky-hero-trust-avatar">{letter}</div>
                  ))}
                </div>
                <div className="ky-hero-trust-text">
                  <strong>500+</strong> farmers already sharing equipment
                </div>
              </div>
            </Col>
            <Col lg={6} className="ky-hero-img-col">
              <div
                className="ky-hero-img-wrap"
                style={{ transform: `translateY(${scrollY * 0.08}px)` }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/images/hero_farming.png`}
                  alt="Farmers using modern equipment"
                  className="ky-hero-img"
                />
                <div className="ky-hero-img-glow" />
                <div className="ky-hero-float-card ky-hero-float-card--1 ky-float">
                  <i className="fas fa-tractor" />
                  <span>250+ Tools Listed</span>
                </div>
                <div className="ky-hero-float-card ky-hero-float-card--2 ky-float" style={{ animationDelay: '1s' }}>
                  <i className="fas fa-star" style={{ color: '#ca8a04' }} />
                  <span>4.8 Avg Rating</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        <div className="ky-hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path
              d="M0,40 C360,120 720,0 1440,60 L1440,120 L0,120 Z"
              fill="var(--ky-bg)"
            />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={featRef}
        className={`ky-features-section ${featVisible ? 'ky-reveal' : ''}`}
        id="features"
      >
        <Container>
          <div className="ky-section-header">
            <span className="ky-section-eyebrow">Why Krishi-Yantra?</span>
            <h2 className="ky-section-heading">
              Everything you need to farm smarter
            </h2>
            <p className="ky-section-desc">
              {"From finding the right equipment to secure bookings and trusted reviews \u2014 we've got you covered."}
            </p>
          </div>
          <Row className="g-4">
            {features.map((feat, i) => (
              <Col key={i} md={6} lg={4}>
                <div
                  className="ky-feature-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="ky-feature-icon-wrap">
                    <i className={feat.icon} />
                  </div>
                  <h3 className="ky-feature-title">{feat.title}</h3>
                  <p className="ky-feature-desc">{feat.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section
        ref={howRef}
        className={`ky-how-section ${howVisible ? 'ky-reveal' : ''}`}
        id="how-it-works"
      >
        <Container>
          <div className="ky-section-header">
            <span className="ky-section-eyebrow">How It Works</span>
            <h2 className="ky-section-heading">
              Start renting in 4 simple steps
            </h2>
          </div>
          <div className="ky-steps">
            <div className="ky-steps-line" aria-hidden="true" />
            {steps.map((step, i) => (
              <div
                key={i}
                className="ky-step"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="ky-step-num-wrap">
                  <div className="ky-step-num">{step.num}</div>
                  <div className="ky-step-icon-ring">
                    <i className={step.icon} />
                  </div>
                </div>
                <h3 className="ky-step-title">{step.title}</h3>
                <p className="ky-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section
        ref={statsRef}
        className={`ky-stats-section ${statsVisible ? 'ky-reveal' : ''}`}
      >
        <Container>
          <Row className="g-4 text-center">
            {[
              { val: 500, suffix: '+', label: 'Active Farmers', icon: 'fas fa-users' },
              { val: 250, suffix: '+', label: 'Tools Listed', icon: 'fas fa-tractor' },
              { val: 1200, suffix: '+', label: 'Bookings Done', icon: 'fas fa-calendar-check' },
              { val: 15, suffix: '+', label: 'States Covered', icon: 'fas fa-map-marked-alt' },
            ].map((stat, i) => (
              <Col key={i} xs={6} md={3}>
                <div className="ky-stat-card" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="ky-stat-card-icon">
                    <i className={stat.icon} />
                  </div>
                  <div className="ky-stat-card-value">
                    <AnimatedCounter end={stat.val} suffix={stat.suffix} />
                  </div>
                  <div className="ky-stat-card-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* SHOWCASE - For Renters */}
      <section className="ky-showcase-section">
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <img
                src={`${process.env.PUBLIC_URL}/images/feature_booking.png`}
                alt="Easy booking on mobile"
                className="ky-showcase-img"
              />
            </Col>
            <Col lg={6}>
              <span className="ky-section-eyebrow">For Renters</span>
              <h2 className="ky-section-heading text-start">
                Book equipment in minutes, not days
              </h2>
              <p className="ky-showcase-desc">
                No more traveling market to market searching for equipment.
                Browse our curated listings, check real-time availability, and
                send a booking request instantly. Track your bookings from your
                dashboard.
              </p>
              <ul className="ky-showcase-list">
                <li><i className="fas fa-check-circle" /> Real-time availability checker</li>
                <li><i className="fas fa-check-circle" /> Transparent per-day pricing</li>
                <li><i className="fas fa-check-circle" /> Owner confirmation system</li>
                <li><i className="fas fa-check-circle" /> Personal booking dashboard</li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SHOWCASE - For Owners */}
      <section className="ky-showcase-section ky-showcase-section--alt">
        <Container>
          <Row className="align-items-center gy-5 flex-lg-row-reverse">
            <Col lg={6}>
              <img
                src={`${process.env.PUBLIC_URL}/images/feature_community.png`}
                alt="Community of farmers"
                className="ky-showcase-img"
              />
            </Col>
            <Col lg={6}>
              <span className="ky-section-eyebrow">For Owners</span>
              <h2 className="ky-section-heading text-start">
                Earn from idle equipment
              </h2>
              <p className="ky-showcase-desc">
                Your tractor sits idle for months each year. List it on
                Krishi-Yantra and earn passive income while helping fellow
                farmers. You stay in full control &mdash; approve or decline every
                booking.
              </p>
              <ul className="ky-showcase-list">
                <li><i className="fas fa-check-circle" /> List equipment in minutes</li>
                <li><i className="fas fa-check-circle" /> Full booking control</li>
                <li><i className="fas fa-check-circle" /> Manage multiple units</li>
                <li><i className="fas fa-check-circle" /> Build trust with reviews</li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section
        ref={testimRef}
        className={`ky-testimonials-section ${testimVisible ? 'ky-reveal' : ''}`}
      >
        <Container>
          <div className="ky-section-header">
            <span className="ky-section-eyebrow">Testimonials</span>
            <h2 className="ky-section-heading">
              Hear from our farming community
            </h2>
          </div>
          <Row className="g-4">
            {testimonials.map((t, i) => (
              <Col key={i} md={4}>
                <div
                  className="ky-testimonial-card"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <div className="ky-testimonial-quote">
                    <i className="fas fa-quote-left" />
                  </div>
                  <p className="ky-testimonial-text">{t.text}</p>
                  <div className="ky-testimonial-author">
                    <div className="ky-testimonial-avatar">{t.avatar}</div>
                    <div>
                      <div className="ky-testimonial-name">{t.name}</div>
                      <div className="ky-testimonial-location">
                        <i className="fas fa-map-marker-alt me-1" />
                        {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef}
        className={`ky-cta-section ${ctaVisible ? 'ky-reveal' : ''}`}
      >
        <div className="ky-cta-bg" aria-hidden="true" />
        <Container className="position-relative">
          <div className="ky-cta-card">
            <h2 className="ky-cta-title">
              Ready to transform your farming?
            </h2>
            <p className="ky-cta-desc">
              Join thousands of farmers who are already saving money and time
              with Krishi-Yantra. Sign up today &mdash; {"it's"} completely free.
            </p>
            <div className="ky-cta-actions">
              {userInfo ? (
                <Link to="/browse" className="btn ky-btn-primary ky-btn-lg">
                  <i className="fas fa-tractor me-2" />
                  Browse Equipment
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn ky-btn-white ky-btn-lg"
                  >
                    Create Free Account
                    <i className="fas fa-arrow-right ms-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn ky-btn-outline-white ky-btn-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default LandingScreen;
