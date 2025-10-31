import TaskCard from "./components/TaskCard";
import IncompleteTasksChart from "./components/IncompleteTasksChart";
import TaskCompletionChart from "./components/TaskCompletionChart";
import UpcomingTasksChart from "./components/UpcomingTasksChart";
import avatarDefault from "../../assets/ava-chat.png";
import TaskCompletionOverTime from "./components/TaskCompletionOverTime";
import "./OverallGroup.scss";

export default function TaskDashboard() {
  const taskStats = [
    {
      id: 1,
      percentage: 80,
      title: "Upcoming task",
      description: "You have 0 task in total",
      total: 10,
      avatars: [avatarDefault, avatarDefault, avatarDefault],
      buttonText: "Check",
      color: "teal",
    },
    {
      id: 2,
      percentage: 80,
      title: "In Process task",
      description: "You have 2 task in total",
      total: 10,
      avatars: [avatarDefault, avatarDefault, avatarDefault],
      buttonText: "Check",
      color: "teal",
    },
    {
      id: 3,
      percentage: 80,
      title: "Completed task",
      description: "You have 8 tasks in total",
      total: 10,
      avatars: [avatarDefault, avatarDefault, avatarDefault],
      buttonText: "Check",
      color: "teal",
    },
    {
      id: 4,
      percentage: 80,
      title: "Overdue task",
      description: "You have 8 tasks in total",
      total: 10,
      avatars: [avatarDefault, avatarDefault, avatarDefault],
      buttonText: "Check",
      color: "orange",
    },
  ];

  return (
    <div className="task-dashboard">
      <div className="dashboard-container">
        {/* Task Status Cards */}
        <div className="task-cards-grid">
          {taskStats.map((stat) => (
            <TaskCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Incomplete tasks by section</h3>
              <button className="menu-btn">⋯</button>
            </div>
            <IncompleteTasksChart />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Total tasks by completion status</h3>
            </div>
            <TaskCompletionChart />
          </div>
        </div>

        {/* Upcoming Tasks Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Up coming task by assignee</h3>
          </div>
          <UpcomingTasksChart />
        </div>

        {/* Task Completion Over Time */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Task completion over time</h3>
          </div>
          <TaskCompletionOverTime />
        </div>
      </div>
    </div>
  );
}
