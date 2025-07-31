import React from "react";
import "./PlanPage.scss";
import PlanComponent from "../../components/PlanComponents/PlanCompnent/PlanComponent";
import RecentComponent from "../../components/PlanComponents/RecentComponent/RecentComponent";
const PlanPage = () => {
  return (
    <div className="plan__page__main">
      <PlanComponent />
      <RecentComponent />
    </div>
  );
};

export default PlanPage;
