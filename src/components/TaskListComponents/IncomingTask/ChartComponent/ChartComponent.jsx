import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ChartComponent.scss";
const ChartComponent = () => {
  const [times, setTimes] = React.useState([
    { _id: 1, time: 12, attribute: "months" },
    { _id: 2, time: 3, attribute: "months" },
    { _id: 3, time: 30, attribute: "days" },
    { _id: 4, time: 7, attribute: "days" },
    { _id: 5, time: 24, attribute: "hours" },
  ]);
  const [data, setData] = React.useState([
    { _id: 1, name: "Planning", percent: 50 },
    { _id: 2, name: "Milestones", percent: 78 },
    { _id: 3, name: "Nextsteps", percent: 50 },
    { _id: 4, name: "Commons Tasks", percent: 25 },
    { _id: 4, name: "Next task", percent: 45 },
  ]);
  const [timeActive, setTimeActive] = React.useState(1);

  const handleChooseTime = (id) => {
    setTimeActive(id);
  };
  return (
    <div className="plan__chart__component">
      <div className="plan__chart__component__container">
        <div className="plan__chart__component__container__table">
          <table>
            <thead>
              <tr>
                {times.map((item) => {
                  return (
                    <th
                      key={item._id}
                      onClick={() => handleChooseTime(item._id)}
                    >
                      <span
                        className={`timing ${
                          timeActive === item._id ? "active" : ""
                        }`}
                      >
                        <span>{item.time}</span>
                        <span>{item.attribute}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
          </table>

          <div className="plan__chart__component__container__chart">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={true} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="percent"
                  fill="#045745"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
