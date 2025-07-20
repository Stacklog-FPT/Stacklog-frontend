import React from "react";
import "./PlanComponent.scss";
const PlanComponent = () => {
  return (
    <div className="plan__component">
      <div className="plan__component__container">
        <div className="plan__component__container__heading">
          <h2>Plan</h2>
        </div>
        <div className="plan__component__container__main__content">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Project</th>
                <th>Assign</th>
                <th>Priority</th>
                <th>Start</th>
                <th>Deadline</th>
                <th>Process</th>
              </tr>
            </thead>
            <tbody>
              <tr></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanComponent;
