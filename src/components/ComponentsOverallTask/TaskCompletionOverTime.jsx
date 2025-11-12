import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

function formatDayToLabel(day) {
  if (!day) return "";
  try {
    const d = new Date(day);
    if (isNaN(d)) return String(day).slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  } catch {
    return String(day).slice(0, 10);
  }
}

const fallback = [
  { day: "12/1", completed: 4, total: 5 },
  { day: "12/3", completed: 3.8, total: 5 },
  { day: "12/5", completed: 3.5, total: 5 },
  { day: "12/7", completed: 3.6, total: 5 },
  { day: "12/9", completed: 3.7, total: 5 },
  { day: "12/11", completed: 3.8, total: 5 },
  { day: "12/13", completed: 3.9, total: 5 },
  { day: "12/15", completed: 4, total: 5 },
  { day: "12/17", completed: 4.1, total: 5 },
  { day: "12/19", completed: 4.2, total: 5 },
  { day: "12/21", completed: 4.3, total: 5 },
  { day: "24/1", completed: 4.5, total: 5 },
]

export default function TaskCompletionOverTime({ data }) {
  const raw = Array.isArray(data) && data.length > 0 ? data : fallback;
  // Aggregate by calendar date (YYYY-MM-DD) so duplicate day entries collapse into one point
  const grouped = raw.reduce((acc, item) => {
    const rawDay = item?.day ?? item?.date ?? item?.createdAt ?? '';
    const parsed = new Date(rawDay);
    const key = !isNaN(parsed) ? parsed.toISOString().slice(0, 10) : String(rawDay).slice(0, 10);
    if (!acc[key]) acc[key] = { day: key, total: 0, completed: 0 };
    acc[key].total += Number(item.totalTask ?? item.total ?? 0);
    acc[key].completed += Number(item.taskCompleted ?? item.completed ?? 0);
    return acc;
  }, {});

  const chartData = Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((k) => ({
      day: formatDayToLabel(grouped[k].day),
      completed: grouped[k].completed,
      total: grouped[k].total,
    }));

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="completed" stroke={"var(--accent)"} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="total" stroke="#d1d5db" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
