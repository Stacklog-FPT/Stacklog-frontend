import React from "react";
import "./TotalTask.scss";
import { PieChart, Pie, Cell } from "recharts";
const TotalTask = () => {
  const [overallProject] = React.useState({
    totalTask: 66577,
    progress: [
      { _id: 1, name: "Progress", progress: 55, color: "#045745" },
      { _id: 2, name: "Upcoming", progress: 15, color: "#edf2f2" },
      { _id: 3, name: "Completed", progress: 20, color: "#000" },
      { _id: 4, name: "OverDue", progress: 20, color: "#FC6158" },
    ],
  });

  const RADIAN = Math.PI / 180;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      ></text>
    );
  };
  return (
    <div className="total__task">
      <div className="total__task__container">
        <h2>Total task by completion status</h2>
        <div className="total__task__container__main__content">
          <div className="total__task__container__main__content__list">
            {overallProject.progress.map((item) => {
              return (
                <div
                  className="total__task__container__main__content__list__item"
                  key={item?._id}
                >
                  <div className="total__task__container__main__content__list__item__left">
                    <div
                      className="dot__color"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <p>{item.name}</p>
                  </div>
                  <div className="total__task__container__main__content__list__item__right">
                    <p>{item.progress}%</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chart__wrapper">
            <PieChart width={240} height={240}>
              <Pie
                data={overallProject.progress}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={6}
                cornerRadius={10}
                dataKey="progress"
                label={renderLabel}
                labelLine={false}
              >
                {overallProject.progress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="chart__center">
              <h2>Total task</h2>
              <p>{overallProject.totalTask.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalTask;
