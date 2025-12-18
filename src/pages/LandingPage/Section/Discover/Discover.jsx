import "./Discover.scss";
import { FiCheckSquare, FiFileText, FiArrowRight } from "react-icons/fi";
import RightImg from "../../../../assets/discover.png";
const Discover = () => {
  return (
    <section className="benefits-section">
      <div className="container">
        <div className="row align-items-center gy-4">
          {/* Left content */}
          <div className="col-lg-6">
            <span className="section-label">Benefits</span>

            <h2 className="section-title">Discover the Benefits of StackLog</h2>

            <p className="section-desc">
              StackLog helps you manage work efficiently and effortlessly. From
              task creation to progress tracking, everything is handled quickly
              and smoothly.
            </p>

            <div className="features">
              {/* Feature 1 */}
              <div className="feature-card active">
                <FiCheckSquare size={28} />
                <div>
                  <h5>Create Tasks</h5>
                  <p>Easily create and assign tasks to team members.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="feature-card">
                <FiFileText size={28} />
                <div>
                  <h5>Track Progress</h5>
                  <p>
                    Monitor project progress in real time to ensure everything
                    runs smoothly.
                  </p>
                </div>
              </div>
            </div>

            <div className="actions">
              <button className="btn btn-outline-success">Learn more</button>

              <button className="btn btn-link start-btn">
                Get started <FiArrowRight />
              </button>
            </div>
          </div>

          <div className="col-lg-6 text-center">
            <img src={RightImg} alt="this is image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discover;
