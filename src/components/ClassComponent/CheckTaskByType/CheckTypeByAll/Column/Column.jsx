import React from "react";
import "./Column.scss";
import iconMore from "../../../../../assets/icon/task/iconMoreTask.png";
import iconVector from "../../../../../assets/icon/task/iconVector.png";
import Task from "../Task/Task";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

const Column = ({ color, status, tasks, members, onShowAddTask }) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${status}`,
  });

  return (
    <div className="column-container" ref={setNodeRef}>
      <div className="column">
        <div className="prop-status" style={{ backgroundColor: color }}>
          <div className="prop-status-left">
            <div className="prop-status-left-text">
              <img src={iconVector} alt="vector icon" />
              <span>{status}</span>
              <span className="prop-status-text-total-task">
                {tasks ? tasks.length : 0}
              </span>
            </div>
          </div>
          <div className="prop-status-right">
            <img src={iconMore} alt="more icon" />
          </div>
        </div>
        <SortableContext
          id={status}
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-task" data-status={status}>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Task
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  percent={task.percentProgress}
                  members={members}
                  createdAt={task.createdAt}
                  dueDate={task.dueDate}
                />
              ))
            ) : (
              <div className="no-tasks">No tasks available</div>
            )}
          </div>
        </SortableContext>
        <div className="btn-add-task" onClick={onShowAddTask}>
          <i className="fa-solid fa-plus"></i>
          <span>Add Task</span>
        </div>
      </div>
    </div>
  );
};

export default Column;
