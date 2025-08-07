import React from "react";
import "./ModalColumn.scss";
import { FaPen } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import AddColumn from "../../Column/AddColumn/AddColumn";
const ModalColumn = (props) => {
  const [isShowColumn, setIsShowColumn] = React.useState(false);
  return (
    <div className="modal__column">
      <div className="modal__column__container">
        <div
          className="modal__column__container__feature"
          onClick={() => setIsShowColumn(!isShowColumn)}
        >
          <FaPen />
          Edit
        </div>
        <div className="modal__column__container__feature">
          <FaRegTrashCan />
          Delete
        </div>
      </div>
    </div>
  );
};

export default ModalColumn;
