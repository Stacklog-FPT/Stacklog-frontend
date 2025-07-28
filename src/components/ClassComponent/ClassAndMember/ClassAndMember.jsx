import React, { useState } from "react";
import "./ClassAndMember.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import iconFilter from "../../../assets/icon/task/iconFilter.png";
import iconMore from "../../../assets/icon/task/iconMore.png";
import GroupService from "../../../service/GroupService";
import { useAuth } from "../../../context/AuthProvider";
const ClassAndMember = () => {
  const { user } = useAuth();
  const { getAllGroup } = GroupService();
  const [classes, setClasses] = useState([
    { id: "class-01", name: "SDN301c" },
    { id: "class-02", name: "SWD301c" },
    { id: "class-03", name: "MMA102c" },
    { id: "class-04", name: "EXE101c" },
  ]);

  const [memberList, setMemberList] = useState([]);

  const visibleMembers = memberList.slice(0, 3);
  const extraCount = memberList.length - visibleMembers.length;

  const handleGetGroupList = async () => {
    try {
      const response = await getAllGroup(user?.token);

      if (response) {
        setMemberList(response?.users);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

  React.useEffect(() => {
    handleGetGroupList();
  }, []);

  return (
    <div className="class__and__member__container">
      <div className="class__and__member__content__member">
        <div className="class__and__member__content__member__class">
          <select>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="class__and__member__content__member__student">
          <ul
            className="class__and__member__content__member__student__list"
            data-extra-count={extraCount > 0 ? extraCount : ""}
          >
            {visibleMembers.map((item) => (
              <li key={item._id}>
                <img
                  src={
                    "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  }
                  alt="Student Avatar"
                />
              </li>
            ))}
            {extraCount > 0 && (
              <li className="extra-count">
                <span>+{extraCount}</span>
              </li>
            )}
          </ul>
          <div className="class__and__member__content__member__button-add">
            <img src={avatar_add_button} alt="add_button_icon" />
            <img src={iconFilter} alt="filter_button_icon" />
            <img src={iconMore} alt="more_button_icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAndMember;
