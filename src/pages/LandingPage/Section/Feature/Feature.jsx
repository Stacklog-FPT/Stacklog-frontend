import React from "react";
import "./Feature.scss";
import RightImg from "../../../../assets/feature.png"; // Đảm bảo thay đường dẫn ảnh đúng

const Feature = () => {
  return (
    <section className="feature-section">
      <div className="container">
        <div className="row align-items-center gy-4">
          {/* Left content */}
          <div className="col-lg-6">
            <span className="section-label">Features</span>
            <h2 className="section-title">
              Manage tasks to help you organize work more efficiently.
            </h2>
            <p className="section-desc">
              StackLog helps you manage work efficiently and effortlessly. From
              task creation to progress tracking, everything is handled quickly
              and smoothly.
            </p>

            <div className="features">
              {/* Feature 1 */}
              <div className="feature-card active">
                <h5>Track your project progress easily</h5>
                <p>
                  Collaboration tools help your team work more smoothly and
                  efficiently.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card">
                <h5>Customize your workflow to fit your work process</h5>
                <p>Design the workflow that best suits your team’s needs.</p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card">
                <h5>Bring flexibility and efficiency to all your projects</h5>
                <p>
                  Our platform optimizes and streamlines every aspect of your
                  work.
                </p>
              </div>
            </div>
          </div>

          {/* Right content with image */}
          <div className="col-lg-6">
            <img src={RightImg} alt="Dashboard" className="img-fluid" />
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-outline-success">Explore</button>

          <button className="btn btn-link start-btn">Get started</button>
        </div>
      </div>
    </section>
  );
};

export default Feature;
