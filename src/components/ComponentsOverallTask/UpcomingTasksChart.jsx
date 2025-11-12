import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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

export default function UpcomingTasksChart({ data }) {
  const fallback = [
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
  ];

  const raw = Array.isArray(data) && data.length > 0 ? data : fallback;

  // Normalize incoming shapes:
  // - if objects have `day` and `totalTask` (from backend upcomingDeadlines) -> map to { name, completed, total }
  // - else handle existing shapes (month/name with completed/total)
  const chartData = raw.map((item) => {
    if (item && Object.prototype.hasOwnProperty.call(item, 'day') && Object.prototype.hasOwnProperty.call(item, 'totalTask')) {
      return {
        name: formatDayToLabel(item.day),
        // backend may send `taskCompleted` instead of `completed`
        completed: Number(item.taskCompleted ?? item.completed ?? 0),
        total: Number(item.totalTask ?? item.total ?? 0),
      };
    }

    if (item && Object.prototype.hasOwnProperty.call(item, 'month')) {
      return { name: item.month, completed: Number(item.completed ?? 0), total: Number(item.total ?? 0) };
    }

    if (item && Object.prototype.hasOwnProperty.call(item, 'name')) {
      return { name: item.name, completed: Number(item.taskCompleted ?? item.completed ?? 0), total: Number(item.total ?? item.totalTask ?? 0) };
    }

    // last resort: stringify
    return { name: String(item?.name || item?.month || ''), completed: Number(item?.taskCompleted ?? item?.completed ?? 0), total: Number(item?.total ?? item?.totalTask ?? 0) };
  });

  return (
    <div className="chart-wrapper">
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
          <Legend />
          <Bar dataKey="completed" fill={"var(--accent)"} radius={[8, 8, 0, 0]} />
          <Bar dataKey="total" fill="#d1d5db" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
