import React from "react";
import "./TaskListComponent.scss";
import ChartCard from "./ChartCard/ChartCard";

const TaskListComponent = () => {
  const [charts] = React.useState([
    {
      _id: "1",
      progress: 95,
      name: "Upcoming task",
      total: 10,
      contribute: 0,
      members: [
        {
          _id: 1,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 2,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 3,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 4,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
      ],
      color: "#045745",
    },
    {
      _id: "2",
      progress: 75,
      name: "Upcoming task",
      total: 10,
      contribute: 0,
      members: [
        {
          _id: 1,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 2,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 3,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 4,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
      ],
      color: "#FC6158",
    },
    {
      _id: "3",
      progress: 60,
      name: "Upcoming task",
      total: 10,
      contribute: 0,
      members: [
        {
          _id: 1,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 2,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 3,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 4,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
      ],
      color: "rgba(111, 165, 130, 0.8)",
    },
    {
      _id: "4",
      progress: 55,
      name: "Progress",
      total: 10,
      contribute: 0,
      members: [
        {
          _id: 1,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 2,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 3,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
        {
          _id: 4,
          ava: "https://blogchiasekienthuc.com/wp-content/uploads/2022/12/meme-duong-tang-8.jpg",
        },
      ],
      color: "#000",
    },
  ]);

  return (
    <div className="task__list">
      <div className="task__list__container">
        <p className="add__task">
          <i className="fa-solid fa-plus"></i>
          <span>Add chart</span>
        </p>
        <div className="task__list__contents">
          {charts.length > 0 ? (
            charts.map((item) => (
              <ChartCard
                key={item._id}
                id={item._id}
                progress={item.progress}
                name={item.name}
                total={item.total}
                contribute={item.contribute}
                members={item.members}
                color={item.color}
              />
            ))
          ) : (
            <h2>The charts are empty!</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListComponent;
