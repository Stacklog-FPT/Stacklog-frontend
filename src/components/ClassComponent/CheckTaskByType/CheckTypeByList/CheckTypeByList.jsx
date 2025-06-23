import React, { useEffect, useState } from "react";
import "./CheckTypeByList.scss";
import Column from "./Column/Column";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
const CheckTypeByList = () => {
  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "ISSUE-01",
      createdAt: "24 Mar - 9:00",
      dueDate: "27 Mar - 9:00",
      percentProgress: "56%",
      status: "In Progress",
      prioritize: "high",
      members: [
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
      ],
    },
    {
      id: "task-2",
      title: "ISSUE-02",
      createdAt: "25 Mar - 9:00",
      dueDate: "25 Mar - 17:00",
      percentProgress: "50%",
      status: "In Progress",
      prioritize: "high",
      members: [
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
      ],
    },
    {
      id: "task-3",
      title: "ISSUE-03",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "71%",
      status: "To Do",
      prioritize: "high",
      members: [
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
      ],
    },
    {
      id: "task-4",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "45%",
      status: "To Do",
      prioritize: "high",
      members: [
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
      ],
    },
    {
      id: "task-5",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "25%",
      status: "To Do",
      prioritize: "high",
      members: [
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
      ],
    },
    {
      id: "task-6",
      title: "ISSUE-01",
      createdAt: "30 Mar - 10:00",
      dueDate: "31 Mar - 24:00",
      percentProgress: "19%",
      status: "Over due",
      prioritize: "high",
      members: [
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
      ],
    },
  ]);
  const [members, setMembers] = useState([]);

  const statuses = [
    { id: 1, status: "To Do", color: "#D8E7E4" },
    { id: 2, status: "In Progress", color: "#045745" },
    { id: 3, status: "Completed", color: "#000000" },
    { id: 4, status: "Over due", color: "#F05122" },
  ];

  useEffect(() => {
    const uniqueMembers = [
      ...new Map(
        tasks
          .flatMap((task) => task.members)
          .map((member) => [member.id, member])
      ).values(),
    ];
    setMembers(uniqueMembers);
  }, [tasks]);
  return (
    <div className="check__task__by__list__container">
      <ClassAndMember />
      <div className="check__task__by__list__column">
        {statuses.map((item) => {
          return (
            <Column
              key={item.id}
              color={item.color}
              status={item.status}
              tasks={tasks}
              members={members}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CheckTypeByList;
