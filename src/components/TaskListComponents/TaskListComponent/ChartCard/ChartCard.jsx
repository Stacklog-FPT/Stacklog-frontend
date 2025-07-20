import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "./ChartCard.scss";

const ChartCard = ({
  id,
  progress,
  name,
  total,
  contribute,
  members,
  color,
}) => {
  const data = [
    { name: "Completed", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];

  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length - visibleMembers.length;

  return (
    <div className="chart__card">
      <div className="chart__card__container">
        <div className="chart__card__top">
          <div className="chart__card__left">
            <PieChart width={200} height={200}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${id}-${index}`}
                    fill={index === 0 ? color : "#eeeeee"}
                  />
                ))}
              </Pie>
            </PieChart>
            <div className="chart__center">
              <p>{progress}%</p>
            </div>
          </div>
          <div className="chart__card__right">
            <h3>{name}</h3>
            <p>You have {contribute} task in total</p>
            <p>Total: {total}</p>
            <div className="chart__card__bottom">
              <div className="chart__card__bottom__member__student">
                <ul
                  className="chart__card__bottom__member__student__list"
                  data-extra-count={extraCount > 0 ? extraCount : ""}
                >
                  {visibleMembers.map((item) => (
                    <li key={item._id}>
                      <img src={item.ava} alt="Student Avatar" />
                    </li>
                  ))}
                  {extraCount > 0 && (
                    <li className="extra-count">
                      <span>+{extraCount}</span>
                    </li>
                  )}
                </ul>
              </div>
              <button>
                <span className="button-text">Check</span>
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
