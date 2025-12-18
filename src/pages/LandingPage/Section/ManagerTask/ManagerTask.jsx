import React from "react";
import "./ManagerTask.scss";
import Image1 from "../../../../assets/manager-task1.png";
import Image2 from "../../../../assets/manager-task2.png";
import Image3 from "../../../../assets/manager-task3.png";

const ManagerTask = () => {
  return (
    <section className="manager-task w-100">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-12">
            <span className="section-label">Features</span>
            <h2 className="section-title">
              Manage tasks to help you organize work more efficiently.
            </h2>
            <p className="section-desc">
              Explore our recent articles on task management and event planning.
            </p>

            <div className="row">
              {/* Card 1 */}
              <div className="col-md-4">
                <div className="feature-card">
                  <img src={Image1} alt="event image" className="img-fluid" />
                  <div className="card-info">
                    <span className="event-date">Events 2025.08.08</span>
                    <h5 className="event-title">
                      Top tips for planning successful events
                    </h5>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-md-4">
                <div className="feature-card">
                  <img src={Image2} alt="event image" className="img-fluid" />
                  <div className="card-info">
                    <span className="event-date">Events 2025.08.08</span>
                    <h5 className="event-title">
                      How to effectively engage your audience
                    </h5>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-md-4">
                <div className="feature-card">
                  <img src={Image3} alt="event image" className="img-fluid" />
                  <div className="card-info">
                    <span className="event-date">Events 2025.08.08</span>
                    <h5 className="event-title">
                      The future of virtual events
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-primary">View All</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManagerTask;
