import React from "react";
import "./Task.scss";
import adjustIcon from "../../../../../assets/icon/checkTaskByList/adjust.png";
const Task = (props) => {
  const visibleMembers = props?.members?.slice(0, 3);
  const extraCount = props?.members?.length - visibleMembers?.length;
  return (
    <div className="task_list_container">
      <div className="task_list_head">
        <img src={adjustIcon} />
        <div className="task_list_head_content">
          <p>.</p>
          <h2>{props.title}</h2>
        </div>
      </div>

      <div className="task_list_member">
        <ul
          className="task-content-members-student-list"
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
      </div>

      <div className="task_list_due_date">
        <h1>HelloWorld!</h1>
      </div>
    </div>
  );
};

export default Task;
