import React, { useState } from "react";
import "./CheckTypeByAll.scss";
import avatar_add_button from "../../../../assets/icon/avatar_add_button.png";
import iconFilter from "../../../../assets/icon/task/iconFilter.png";
import iconMore from "../../../../assets/icon/task/iconMore.png";
import Column from "./Column/Column";
import { DndContext, rectIntersection, closestCorners } from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

const customCollisionDetection = (args) => {
  const droppableCollisions = rectIntersection(args) || [];
  console.log("droppableCollisions:", droppableCollisions);

  if (droppableCollisions.length > 0) {
    return droppableCollisions;
  }

  const sortableCollisions = closestCorners(args) || [];
  console.log("sortableCollisions:", sortableCollisions);

  return sortableCollisions.length > 0 ? sortableCollisions : null;
};

const CheckTypeByAll = () => {
  const [classes, setClasses] = useState([
    { id: "class-01", name: "SDN301c" },
    { id: "class-02", name: "SWD301c" },
    { id: "class-03", name: "MMA102c" },
    { id: "class-04", name: "EXE101c" },
  ]);

  const [members, setMembers] = useState([
    {
      id: "student-1",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-2",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-3",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-4",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: "student-5",
      img: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "ISSUE-01",
      createdAt: "24 Mar - 9:00",
      dueDate: "27 Mar - 9:00",
      percentProgress: "56%",
      status: "In Progress",
    },
    {
      id: "task-2",
      title: "ISSUE-02",
      createdAt: "25 Mar - 9:00",
      dueDate: "25 Mar - 17:00",
      percentProgress: "50%",
      status: "In Progress",
    },
    {
      id: "task-3",
      title: "ISSUE-03",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "71%",
      status: "To Do",
    },
    {
      id: "task-4",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "45%",
      status: "To Do",
    },
    {
      id: "task-5",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "25%",
      status: "To Do",
    },
    {
      id: "task-6",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "19%",
      status: "Over due",
    },
  ]);

  const statuses = [
    { id: 1, status: "To Do", color: "#D8E7E4" },
    { id: 2, status: "In Progress", color: "#045745" },
    { id: 3, status: "Completed", color: "#000000" },
    { id: 4, status: "Over due", color: "#F05122" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeColumn, setActiveColumn] = useState(null);

  const handleDragOver = (event) => {
    const { over } = event;
    if (over) {
      const overId = over.id;
      if (overId.startsWith("droppable-")) {
        const targetStatus = overId.replace("droppable-", "");
        setActiveColumn(targetStatus);
      }
    } else {
      setActiveColumn(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    // Debug log
    console.log({
      activeId,
      overId: over.id,
      overData: over.data.current,
      activeColumn,
    });

    let updatedTasks = [...tasks];
    const activeIndex = tasks.findIndex((task) => task.id === activeId);

    // Kiểm tra xem có thả vào khu vực droppable của cột không
    const droppableId = over.id;
    const isOverDroppable = droppableId.startsWith("droppable-");
    const isOverTask = tasks.some((task) => task.id === over.id);

    if (isOverDroppable || activeColumn) {
      // Thả vào cột (bao gồm cột rỗng)
      const targetStatus =
        activeColumn || droppableId.replace("droppable-", "");
      const targetTasks = tasks.filter(
        (task) => task.status === targetStatus && task.id !== activeId
      );
      let dropIndex = over.data.current?.sortable?.index ?? 0; // Chèn vào đầu nếu cột rỗng

      // Cập nhật trạng thái của task
      updatedTasks = updatedTasks.map((task) =>
        task.id === activeId ? { ...task, status: targetStatus } : task
      );

      // Tính toán chỉ số mới trong danh sách chung
      let targetIndex = 0;
      if (targetTasks.length === 0) {
        // Nếu cột rỗng, chèn vào vị trí hợp lý
        const firstTaskInOtherColumn = tasks.findIndex(
          (task) => task.status === targetStatus
        );
        targetIndex =
          firstTaskInOtherColumn === -1 ? tasks.length : firstTaskInOtherColumn;
      } else {
        // Nếu cột không rỗng, chèn vào vị trí thả
        targetIndex =
          tasks.findIndex((task) => task.status === targetStatus) + dropIndex;
      }

      // Di chuyển task
      updatedTasks.splice(activeIndex, 1);
      updatedTasks.splice(targetIndex, 0, {
        ...activeTask,
        status: targetStatus,
      });
    } else if (isOverTask) {
      // Thả lên một task khác
      const overTask = tasks.find((task) => task.id === over.id);
      if (!overTask) return;

      const overIndex = tasks.findIndex((task) => task.id === over.id);
      const targetStatus = overTask.status;

      if (activeTask.status === targetStatus) {
        // Sắp xếp lại trong cùng cột
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, activeTask);
      } else {
        // Di chuyển sang cột khác
        updatedTasks = updatedTasks.map((task) =>
          task.id === activeId ? { ...task, status: targetStatus } : task
        );
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, {
          ...activeTask,
          status: targetStatus,
        });
      }
    }

    setTasks(updatedTasks);
    setActiveColumn(null); // Reset active column sau khi thả
  };

  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length - visibleMembers.length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="check-task-by-all-container">
        <div className="check-task-by-all-content">
          <div className="check-task-by-all-content-member">
            <div className="check-task-by-all-content-member-class">
              <select>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="check-task-by-all-content-member-student">
              <ul
                className="check-task-by-all-content-member-student-list"
                data-extra-count={extraCount > 0 ? extraCount : ""}
              >
                {visibleMembers.map((item) => (
                  <li key={item.id}>
                    <img src={item.img} alt="Student Avatar" />
                  </li>
                ))}
                {extraCount > 0 && (
                  <li className="extra-count">
                    <span>+{extraCount}</span>
                  </li>
                )}
              </ul>
              <div className="check-task-by-all-content-member-button-add">
                <img src={avatar_add_button} alt="add_button_icon" />
                <img src={iconFilter} alt="filter_button_icon" />
                <img src={iconMore} alt="more_button_icon" />
              </div>
            </div>
          </div>
          <div className="task-column-container">
            {statuses.map((item) => (
              <Column
                key={item.id}
                status={item.status}
                color={item.color}
                tasks={tasks.filter((task) => task.status === item.status)}
                members={members}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default CheckTypeByAll;
