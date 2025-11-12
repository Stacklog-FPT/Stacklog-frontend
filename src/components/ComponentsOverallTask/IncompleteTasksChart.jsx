import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function IncompleteTasksChart({ data }) {
  const fallback = [
    { name: "", value: 0 },
    { name: "", value: 0 },
    { name: "", value: 0 },
    { name: "", value: 0 },
  ];

  const chartData = Array.isArray(data) && data.length > 0 ? data : fallback;

  return (
    <div className="chart-wrapper">
      <div className="time-filter">
        {/* <button className="filter-btn active">12 months</button>
        <button className="filter-btn">3 months</button>
        <button className="filter-btn">30 days</button>
        <button className="filter-btn">7 days</button>
        <button className="filter-btn">24 hours</button> */}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="value" fill={"var(--accent)"} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
