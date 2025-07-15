import React from "react";
import "./NavbarList.scss";
const NavbarList = () => {
  const [types, setTypes] = React.useState([
    { id: 1, type: "Lecture" },
    { id: 2, type: "Student" },
  ]);
  return (
    <div className="navbar__list__container">
      <div className="navbar__list__items">
        {types.map((item) => {
          return (
            <div className="navbar__list__items__item" key={item.id}>
              <p>{item.type}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavbarList;
