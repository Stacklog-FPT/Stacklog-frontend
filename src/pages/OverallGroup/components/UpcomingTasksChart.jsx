import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", completed: 400, total: 800 },
  { month: "Feb", completed: 500, total: 900 },
  { month: "Mar", completed: 350, total: 700 },
  { month: "Apr", completed: 450, total: 850 },
  { month: "May", completed: 380, total: 750 },
  { month: "Jun", completed: 420, total: 800 },
  { month: "Jul", completed: 390, total: 780 },
  { month: "Aug", completed: 410, total: 820 },
  { month: "Sep", completed: 400, total: 800 },
  { month: "Oct", completed: 430, total: 850 },
  { month: "Nov", completed: 420, total: 840 },
  { month: "Dec", completed: 400, total: 800 },
]

export default function UpcomingTasksChart() {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="completed" fill={"var(--accent)"} radius={[8, 8, 0, 0]} />
          <Bar dataKey="total" fill="#d1d5db" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
