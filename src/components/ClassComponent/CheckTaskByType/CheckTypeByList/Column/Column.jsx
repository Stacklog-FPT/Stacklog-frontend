import React, { useState } from "react";
import "./Column.scss";
import iconVector from "../../../../../assets/icon/task/iconVector.png";
import add from "../../../../../assets/icon/checkTaskByList/add.png";
import Task from "../Task/Task";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

const Column = ({ color, status, tasks, onShowAddTask, onShowComment }) => {
  const [showAdd, setShowAdd] = useState(null);
  const { setNodeRef } = useDroppable({
    id: `droppable-${status}`,
  });

  return (
    <div className="column-list-container" ref={setNodeRef}>
      <div className="column-list">
        <div className="prop-status" style={{ backgroundColor: color }}>
          <img src={iconVector} alt="vector icon" />
          <div className="prop-status-length">
            <p>{status}</p>
          </div>
        </div>
        <div className="column-task" data-status={status}>
          <SortableContext
            id={status}
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Assign</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Action</th>
                  <th>
                    <img
                      src={add}
                      alt="add task"
                      onClick={() => onShowAddTask(status)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((item) => (
                    <Task
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      members={item.members}
                      dueDate={item.dueDate}
                      priority={item.prioritize}
                      onShowComment={onShowComment}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <h2>No task for today!</h2>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default Column;
