import React from "react";
import "./GradesPage.scss";
import GradesComponents from "../../components/GradesComponents/GradesComponents";
import DetailScore from "../../components/GradesComponents/DetailScore/DetailScore";
import AddCore from "../../components/GradesComponents/AddCore/AddCore";
const GradesPage = () => {
  const [activeDetail, setActiveDetail] = React.useState(false);
  const [activityAddCore, setActivityAddCore] = React.useState(false);

  const handleActiveDetail = () => {
    setActiveDetail(!activeDetail);
  };

  const handleActivityAddCore = () => {
    setActivityAddCore(!activityAddCore);
  };
  console.log(activityAddCore);
  return (
    <div className="grades__page">
      <GradesComponents
        handleActiveDetail={handleActiveDetail}
        handleActivityAddCore={handleActivityAddCore}
      />
      {activeDetail && <DetailScore handleActiveDetail={handleActiveDetail} />}
      {activityAddCore && (
        <AddCore handleActivityAddCore={handleActivityAddCore} />
      )}
    </div>
  );
};

export default GradesPage;
