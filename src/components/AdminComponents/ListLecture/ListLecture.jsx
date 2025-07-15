import React from "react";
import "./ListLecture.scss";
const ListLecture = () => {
  return (
    <div className="list__lecture__container">
      <div className="list__lecture">
        <div className="list__lecture__heading">
          <div className="list__lecture__heading__title">
            <h2>Manage Lecture</h2>
          </div>

          <div className="list__lecture__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListLecture;
