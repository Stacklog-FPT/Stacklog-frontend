import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "./TaskCompletionChart.scss";

export default function TaskCompletionChart() {
  const [overallProject] = React.useState({
    totalTask: 66577,
    progress: [
      { _id: 1, name: "Upcoming", progress: 20.02, color: "#edf2f2" },
      { _id: 2, name: "In Process", progress: 60.02, color: "#045745" },
      { _id: 3, name: "Completed", progress: 12.02, color: "#000" },
      { _id: 4, name: "Over due", progress: 7.94, color: "#f97316" },
    ],
  });

  const totalTasks = overallProject.totalTask;

  return (
    <div className="task-completion-chart">
      <div className="chart-card-inner">
        <h3 className="chart-title"></h3>

        <div className="chart-row">
          <div className="chart-legend">
            {overallProject.progress.map((item) => (
              <div className="legend-item" key={item._id}>
                <div className="legend-left">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span className="legend-label">{item.name}</span>
                </div>
                <div className="legend-right">
                  <span className="legend-value">{item.progress.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chart-donut">
            <PieChart width={260} height={260}>
              <Pie
                data={overallProject.progress}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={6}
                cornerRadius={10}
                dataKey="progress"
              >
                {overallProject.progress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>

            <div className="donut-center-text">
              <div className="donut-total">Total task</div>
              <div className="donut-value">{totalTasks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
