import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "./OverallProject.scss";

const OverallProject = () => {
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
    <div className="overall__project">
      <div className="overall__project__container">
        <div className="overall__project__container__heading">
          <p>Overall Project</p>
        </div>

        <div className="chart__wrapper">
          <PieChart width={240} height={220}>
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
        <div className="overall__project__container__list">
          {overallProject.progress.map((item) => {
            return (
              <div
                className="overall__project__container__list__item"
                key={item?._id}
              >
                <div className="overall__project__container__list__item__left">
                  <div
                    className="dot__color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <p>{item.name}</p>
                </div>
                <div className="overall__project__container__list__item__right">
                  <p>{item.progress}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn__see__detail">
        <p>View details</p>
        <i className="fa-solid fa-arrow-up-right-from-square"></i>
      </button>
    </div>
  );
};

export default OverallProject;
