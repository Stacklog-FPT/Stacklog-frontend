import React from "react";
import "./CheckTypeByAll.scss";
import avatar_add_button from "../../../../assets/icon/avatar_add_button.png";
import iconFilter from "../../../../assets/icon/task/iconFilter.png";
import iconMore from "../../../../assets/icon/task/iconMore.png";
import Column from "./Column/Column";

const CheckTypeByAll = () => {
  const [classes, setClasses] = React.useState([
    { id: "class-01", name: "SDN301c" },
    { id: "class-02", name: "SWD301c" },
    { id: "class-03", name: "MMA102c" },
    { id: "class-04", name: "EXE101c" },
  ]);

  const [members, setMembers] = React.useState([
    {
      id: "student-1",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-2",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-3",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-4",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-5",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
  ]);

  const [tasks, setTasks] = React.useState([
    {
      id: "task-1",
      title: "ISSUE-01",
      createdAt: "24 Mar - 9:00",
      dueDate: "27 Mar - 9:00",
      percentProgress: "56%",
      status: "In Progress",
    },
    {
      id: "task-2",
      title: "ISSUE-02",
      createdAt: "25 Mar - 9:00",
      dueDate: "25 Mar - 17:00",
      percentProgress: "50%",
      status: "In Progress",
    },
    {
      id: "task-3",
      title: "ISSUE-03",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "71%",
      status: "To Do",
    },
    {
      id: "task-4",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "45%",
      status: "To Do",
    },
    {
      id: "task-5",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "25%",
      status: "To Do",
    },
    {
      id: "task-6",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "19%",
      status: "Over due",
    },
  ]);

  const statuses = [
    { id: 1, status: "To Do", color: "#D8E7E4" },
    { id: 2, status: "In Progress", color: "#045745" },
    { id: 3, status: "Completed", color: "#000000" },
    { id: 4, status: "Over due", color: "#F05122" },
  ];

  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length - visibleMembers.length;

  return (
    <div className="check-task-by-all-container">
      <div className="check-task-by-all-content">
        <div className="check-task-by-all-content-member">
          <div className="check-task-by-all-content-member-class">
            <select>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="check-task-by-all-content-member-student">
            <ul
              className="check-task-by-all-content-member-student-list"
              data-extra-count={extraCount > 0 ? extraCount : ""}
            >
              {visibleMembers.map((item) => (
                <li key={item.id}>
                  <img src={item.img} alt="Student Avatar" />
                </li>
              ))}
              {extraCount > 0 && (
                <li className="extra-count">
                  <span>+{extraCount}</span>
                </li>
              )}
            </ul>

            <div className="check-task-by-all-content-member-button-add">
              <img src={avatar_add_button} alt="add_button_icon" />
              <img src={iconFilter} alt="filter_button_icon" />
              <img src={iconMore} alt="more_button_icon" />
            </div>
          </div>
        </div>
        <div className="task-column-container">
          {statuses.map((item) => (
            <Column
              key={item.id}
              status={item.status}
              color={item.color}
              tasks={tasks.filter((task) => task.status === item.status)}
              members={members}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckTypeByAll;
