import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top CTA */}
        <div className="footer-cta">
          <div className="cta-text">
            <h4>Start your 30-day free trial</h4>
            <p>Join over 4,000+ startups already growing with Untitled.</p>
          </div>

          <div className="cta-actions">
            <button className="btn btn-outline-secondary">Learn more</button>
            <button className="btn btn-success">Get started</button>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Main footer */}
        <div className="row gy-4 footer-content">
          {/* Logo */}
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-logo">STACKLOG</h5>
            <p className="footer-desc">
              Design amazing digital experiences that create more happy in the
              world.
            </p>
          </div>

          {/* Product */}
          <div className="col-lg-2 col-md-6">
            <h6>Product</h6>
            <ul>
              <li>Overview</li>
              <li>Features</li>
              <li>Solutions</li>
              <li>Tutorials</li>
              <li>Pricing</li>
              <li>Releases</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-6">
            <h6>Resources</h6>
            <ul>
              <li>Blog</li>
              <li>Newsletter</li>
              <li>Events</li>
              <li>Help centre</li>
              <li>Tutorials</li>
              <li>Support</li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="col-lg-4 col-md-6">
            <h6>Stay up to date</h6>
            <div className="subscribe-form">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
              />
              <button className="btn btn-success">Subscribe</button>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2077 Untitled UI. All rights reserved.</p>
          <div className="footer-links">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
