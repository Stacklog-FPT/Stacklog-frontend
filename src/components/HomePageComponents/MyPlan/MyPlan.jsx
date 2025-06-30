import { useState } from "react";
import "./MyPlan.scss";
import dragIcon from "../../../assets/home/planDocument/drag-icon.png";
import moreIcon from "../../../assets/home/planDocument/more_horiz.png";
import zoomIcon from "../../../assets/home/planDocument/zoom_big.png";
import planVector from "../../../assets/home/planDocument/planVector.png";
import adjustVector from "../../../assets/home/planDocument/adjust.png";
import dot from "../../../assets/home/planDocument/fiber_manual_record.png";

const MyPlan = (props) => {
  const [activeType, setActiveType] = useState("Todo");
  const planType = [{ type: "Todo" }, { type: "Done" }, { type: "Delegated" }];
  // Get from API Be
  const planToday = [
    { type: "Today", target: 0, tasks: [] },
    {
      type: "Overdue",
      target: 5,
      tasks: [
        { id: 1, name: "Long", title: "Done FE " },
        { id: 2, name: "Nhật", title: "Done BE" },
        { id: 3, name: "Thành", title: "Done App" },
        { id: 4, name: "Yến", title: "Analysis Requirement" },
        { id: 5, name: "Việt", title: "Testing Application" },
      ],
    },
  ];
  return (
    <div className="my__plan__container">
      <div className="my__plan__heading">
        <div className="my__plan__heading__text">
          <img src={dragIcon} alt="Drag icon" />
          <p className="text-center pt-3">My Plan</p>
        </div>
        <div className="my__plan__heading__icon">
          <img src={moreIcon} alt="More icon" />
          <img src={zoomIcon} alt="Zoom icon" />
        </div>
      </div>
      <div className="my__plan__navbar">
        <ul className="my__plan__navbar__list">
          {planType.map((item) => (
            <li
              key={item.type}
              className={`my__plan__navbar__element ${
                activeType === item.type ? "active" : ""
              }`}
              onClick={() => setActiveType(item.type)}
            >
              {item.type}
            </li>
          ))}
        </ul>
      </div>
      <div className="my__plan__list">
        <div className="my__plan__list__time">
          <p>
            {props.getCurrentHour()}
            {props.getCurrentSession().toLowerCase()}
          </p>
          <p>-</p>
          <p>
            {props.dayOfWeeks} {props.date} {props.month} {props.year}
          </p>
        </div>
        <div className="my__plan__list__target">
          {planToday.length > 0 && planToday ? (
            planToday.map((item) => {
              return (
                <div className="my__plan__list__target__item" key={item.type}>
                  <div className="my__plan__list__target__item__head">
                    <img src={planVector} alt="this is icon..." />
                    <h2>{item.type}</h2>
                    <p>{item.target}</p>
                  </div>
                  {item.tasks.length > 0 && item.tasks ? (
                    item.tasks.map((item) => {
                      return (
                        <div className="my__plan__list__target__item__task">
                          <div className="my__plan__list__target__item__task__content">
                            <img src={adjustVector} alt="this is icon..." />
                            <p>{item.name} -</p>
                            <p>{item.title}</p>
                          </div>
                          <div className="my__plan__list__target__item__task__day__time">
                            <p>
                              {props.getCurrentHour()}
                              {props.getCurrentSession().toLowerCase()}
                            </p>
                            <p>-</p>
                            <p>
                              {props.dayOfWeeks} {props.date} {props.month}{" "}
                              {props.year}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <h2 className="no_task">
                      Tasks and reminders assigned to you will show here
                    </h2>
                  )}
                </div>
              );
            })
          ) : (
            <h2>Tasks and reminders assigned to you will show here</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPlan;
