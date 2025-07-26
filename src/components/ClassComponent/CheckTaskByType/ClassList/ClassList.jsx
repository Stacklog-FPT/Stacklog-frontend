import React from "react";
import "./ClassList.scss";
import { IoFilter } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import ClassService from "../../../../service/ClassService";
import { useAuth } from "../../../../context/AuthProvider";

const ClassList = () => {
  const { user } = useAuth();
  const { getMembersInClass } = ClassService();
  const [classList] = React.useState([
    { _id: "1", name: "SDN302c" },
    { _id: "2", name: "SWD301c" },
    { _id: "3", name: "SWP391c" },
    { _id: "4", name: "PGM391c" },
  ]);

  const handleGetMembersInClass = async () => {
    try {
      const response = await getMembersInClass(user?.token);
      if (response) {
        console.log(response);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  React.useEffect(() => {
    handleGetMembersInClass();
  }, []);
  return (
    <div className="class__list">
      <div className="class__list__container">
        <div className="class__list__container__heading">
          <div className="class__list__container__heading__select">
            <select>
              {classList.map((item) => {
                return (
                  <option value={item.name} key={item._id}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="class__list__container__heading__feature">
            <IoFilter className="icon" />
            <FaPlus className="icon" />
            <FaTrash className="icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassList;
