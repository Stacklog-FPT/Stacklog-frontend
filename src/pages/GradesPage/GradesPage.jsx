import React from "react";
import "./GradesPage.scss";
import GradesComponents from "../../components/GradesComponents/GradesComponents";
import DetailScore from "../../components/GradesComponents/DetailScore/DetailScore";
const GradesPage = () => {
  const [activeDetail, setActiveDetail] = React.useState(false);

  const handleActiveDetail = () => {
    setActiveDetail(!activeDetail);
  };

  return (
    <div className="grades__page">
      <GradesComponents handleActiveDetail={handleActiveDetail} />
      {activeDetail && <DetailScore handleActiveDetail={handleActiveDetail} />}
    </div>
  );
};

export default GradesPage;
