import React, { useState, useEffect } from "react";
import "./MainComponent.scss";
import Calendar from "./Calendar/Calendar";
import { FaPlus } from "react-icons/fa";
import AddScheduleForms from "./AddScheduleForm/AddScheduleForm";
const MainComponent = () => {
  const [isShowAdd, setIsShowAdd] = useState(false);
  const [slot, setSlot] = useState(null);

  const handleClose = () => {
    setIsShowAdd(false);
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    });
  }, []);

  return (
    <div className="main__component">
      <div className="main__component__container">
        <div className="main__component__container__heading">
          <div className="main__component__container__heading__title">
            <h2>Team schedule</h2>
          </div>

          <div className="main__component__container__heading__btn__add">
            <button onClick={() => setIsShowAdd(!isShowAdd)}>
              <FaPlus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
        <Calendar />
      </div>

      {isShowAdd && <AddScheduleForms onClose={handleClose} />}
    </div>
  );
};

export default MainComponent;
