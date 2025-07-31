import React from "react";
import "./Column.scss";
import iconMore from "../../../../../assets/icon/task/iconMoreTask.png";
import iconVector from "../../../../../assets/icon/task/iconVector.png";
import Task from "../Task/Task";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

const Column = ({
  color,
  statusId,
  status,
  tasks,
  members,
  onShowAddTask,
  onShowComment,
  commentsLen,
  isLoading = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${statusId}`,
  });

  return (
    <div
      className={`column-container ${isOver ? "over" : ""}`}
      ref={setNodeRef}
    >
      <div className="column">
        <div className="prop-status" style={{ backgroundColor: color }}>
          <div className="prop-status-left">
            <div className="prop-status-left-text">
              <img src={iconVector} alt="vector icon" />
              <span>{status}</span>
              <span className="prop-status-text-total-task">
                {isLoading ? (
                  <Skeleton width={20} height={16} />
                ) : tasks ? (
                  tasks.length
                ) : (
                  0
                )}
              </span>
            </div>
          </div>
          <div className="prop-status-right">
            <img src={iconMore} alt="more icon" />
          </div>
        </div>
        <SortableContext
          id={statusId}
          items={tasks?.map((task) => task.taskId) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-task" data-status={statusId}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="task-skeleton"
                  style={{ marginBottom: "10px" }}
                >
                  <Skeleton height={80} borderRadius={8} />
                </div>
              ))
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <Task
                  key={task?.taskId}
                  id={task?.taskId}
                  title={task?.taskTitle}
                  percent={task?.percentProgress}
                  members={members}
                  createdAt={task?.createdAt}
                  dueDate={task?.taskDueDate}
                  onShowComment={onShowComment}
                  task={task}
                  commentsLen={commentsLen}
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

export default React.memo(Column);