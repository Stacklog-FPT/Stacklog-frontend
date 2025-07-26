import React from "react";
import "./PlanComponent.scss";
import avatarImg from "../../../assets/ava-chat.png";
import { FaFlag, FaEllipsisV } from "react-icons/fa";

const data = [
  {
    project: "Intelligent Flow...",
    assign: [avatarImg, avatarImg, avatarImg, avatarImg, avatarImg],
    priority: { label: "Urgent", color: "#FF5B5B" },
    start: "Jan 4, 2022",
    deadline: "Jan 4, 2022",
    process: { label: "In process", color: "#2563EB", percent: 10 },
  },
  {
    project: "Seamless Cloud...",
    assign: [avatarImg, avatarImg, avatarImg, avatarImg, avatarImg],
    priority: { label: "High", color: "#FF9900" },
    start: "Jan 4, 2022",
    deadline: "Jan 4, 2022",
    process: { label: "Upcoming", color: "#22C55E", percent: 0 },
  },
  {
    project: "AI-Powered Pr...",
    assign: [avatarImg, avatarImg, avatarImg, avatarImg],
    priority: { label: "Medium", color: "#6366F1" },
    start: "Jan 4, 2022",
    deadline: "Jan 4, 2022",
    process: { label: "Completed", color: "#6366F1", percent: 100 },
  },
  {
    project: "Next-Gen Scal...",
    assign: [avatarImg, avatarImg, avatarImg, avatarImg],
    priority: { label: "Low", color: "#14B8A6" },
    start: "Jan 4, 2022",
    deadline: "Jan 4, 2022",
    process: { label: "Over due", color: "#FF9900", percent: 80 },
  },
  {
    project: "Advanced Mac...",
    assign: [avatarImg, avatarImg, avatarImg, avatarImg],
    priority: { label: "Trivial", color: "#A855F7" },
    start: "Jan 4, 2022",
    deadline: "Jan 4, 2022",
    process: { label: "In process", color: "#2563EB", percent: 30 },
  },
];

const PlanComponent = () => {
  return (
    <div className="plan__component">
      <div className="plan__component__container">
        <div className="plan__component__container__heading">
          <h2>Plan</h2>
        </div>
        <div className="plan__component__container__main__content">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Project</th>
                <th>Assign</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Start</th>
                <th>Process</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="checkbox">
                    <input type="checkbox" />
                  </td>
                  <td>{item.project}</td>
                  <td>
                    <div className="avatar-group">
                      {item.assign.map((imgUrl, i) => (
                        <img
                          src={imgUrl}
                          alt="avatar"
                          key={i}
                          className="avatar"
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className="priority"
                      style={{
                        backgroundColor: `${item.priority.color}1A`,
                        color: item.priority.color,
                      }}
                    >
                      <FaFlag style={{ marginRight: 4 }} />
                      {item.priority.label}
                    </span>
                  </td>
                  <td>{item.deadline}</td>
                  <td>{item.start}</td>
                  <td>
                    <span
                      className="process-status"
                      style={{
                        backgroundColor: `${item.process.color}1A`,
                        color: item.process.color,
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontWeight: 500,
                        fontSize: "13px",
                        minWidth: "70px",
                        display: "inline-block",
                        textAlign: "center",
                      }}
                    >
                      {item.process.label}
                    </span>
                  </td>
                  <td>
                    <div className="process-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.process.percent}%`,
                            backgroundColor: item.process.color,
                          }}
                        ></div>
                      </div>
                      <span className="process-percent">
                        {item.process.percent}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <FaEllipsisV className="ellipsis-icon" style={{width: '100%'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="arrow">&lt;</span>
          {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
            <span key={i} className={`page${p === 1 ? " active" : ""}`}>
              {p}
            </span>
          ))}
          <span className="arrow">&gt;</span>
        </div>
      </div>
    </div>
  );
};

export default PlanComponent;
