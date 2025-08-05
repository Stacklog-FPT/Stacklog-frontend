import React, { useState } from "react";
import "./AddColumn.scss";
import statusApi from "../../../service/ColumnService";
import { useAuth } from "../../../context/AuthProvider";

const AddColumn = ({ isClose, group }) => {
  const { user } = useAuth();
  const [color, setColor] = useState("#3498db");
  const [columnData, setColumnData] = useState({
    statusTaskName: "",
    statusTaskColor: "" || color,
    groupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addStatus } = statusApi();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setColumnData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        statusTaskName: columnData.statusTaskName,
        statusTaskColor: columnData.statusTaskColor || color,
        groupId: group,
      };

      const response = await addStatus(user?.token, payload);

      setColumnData({
        statusTaskName: "",
        statusTaskColor: color,
        groupId: "",
      });
      setIsSubmitting(false);
      if (isClose) isClose();
    } catch (e) {
      return e.message;
    }
  };
  return (
    <div className="add__column">
      <form className="add__column__container" onSubmit={handleSubmit}>
        <div className="add__column__container__heading">
          <h2>Add Status</h2>
          <i className="fa-solid fa-xmark" onClick={isClose}></i>
        </div>

        <div className="add__column__container__content">
          <div className="add__column__container__content__input">
            <input
              type="text"
              placeholder="Enter status name..."
              name="statusTaskName"
              value={columnData.statusTaskName}
              onChange={handleInputChange}
            />
          </div>

          <div className="add__column__container__content__color">
            <label htmlFor="color-picker">Choose color:</label>
            <input
              id="color-picker"
              type="color"
              name="statusTaskColor"
              value={columnData.statusTaskColor}
              onChange={handleInputChange}
            />
          </div>

          <button
            className="btn__add__status"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddColumn;
