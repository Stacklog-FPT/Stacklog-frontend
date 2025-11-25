import React from "react";
import "./NavbarList.scss";
const NavbarList = ({ listByRole, setListByRole }) => {
  const [types, setTypes] = React.useState([
    { id: 1, type: "Semester", icon: "fa-solid fa-chalkboard-user" },
    { id: 2, type: "Class", icon: "fa-solid fa-users" },
    { id: 3, type: "Lecture", icon: "fa-solid fa-hashtag" },
    { id: 4, type: "Student", icon: "fa-solid fa-users" },
  ]);
  return (
    <div className="navbar__list__container">
      <div className="navbar__list__items">
        {types.map((item) => {
          return (
            <div
              className={`navbar__list__items__item ${
                listByRole === item.type ? "active" : ""
              }`}
              key={item.id}
              onClick={() => setListByRole(item.type)}
            >
              <i className={item.icon}></i>
              <p>{item.type}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavbarList;
