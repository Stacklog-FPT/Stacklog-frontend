import React from "react";
import "./CheckTaskBySelf.scss";
import ClassAndMember from "../../ClassAndMember/ClassAndMember";
import Tree from "react-d3-tree";
import styled from "styled-components";

const StyledNode = styled.div`
  padding: 15px 30px;
  border-radius: 8px;
  border: 2px solid
    ${(props) =>
      props.level === "class"
        ? "#007bff"
        : props.level === "student"
        ? "#28a745"
        : props.level === "task"
        ? "#ffc107"
        : "#dc3545"};
  background-color: #fff;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 150px;
  max-width: 300px;
  word-wrap: break-word;
`;

const CheckTaskBySelf = () => {
  const taskByStudent = {
    nameStudent: "LongBuaDinh",
    class: "SDN301c",
    task: [
      {
        id: 1,
        title: "Create a website with ReactJs",
        priority: "High",
        subTask: [{ id: 1, title: "Learn at F8" }],
      },
      {
        id: 2,
        title: "Create a website like Facebook using MernStack",
        priority: "Medium",
        subTask: [
          { id: 1, title: "Learn MongoDB" },
          { id: 2, title: "Learn NodeJs" },
          { id: 3, title: "Building website with ExpressJs" },
          { id: 4, title: "Create API and mockup them with ReactJs" },
          {
            id: 5,
            title:
              "Learn build website faster with Bootstrap or TailwindCss library",
          },
        ],
      },
      {
        id: 3,
        title: "Learn Python",
        priority: "High",
        subTask: [
          { id: 1, title: "Learn Operator" },
          { id: 2, title: "Introduce about Python in W3school" },
          { id: 3, title: "For in python" },
        ],
      },
      {
        id: 4,
        title: "Report and presentation with mentor",
        priority: "High",
        subTask: [
          { id: 1, title: "Write and statistical with Excel" },
          { id: 2, title: "Prepare and practice for presentation" },
          { id: 3, title: "Submit and waiting for review from mentor" },
        ],
      },
    ],
  };

  const treeData = {
    name: taskByStudent.class,
    level: "class",
    children: [
      {
        name: taskByStudent.nameStudent,
        level: "student",
        children: taskByStudent.task.map((task) => ({
          name: `${task.title} (${task.priority})`,
          level: "task",
          children: task.subTask
            ? task.subTask.map((subTask) => ({
                name: subTask.title,
                level: "subtask",
              }))
            : [],
        })),
      },
    ],
  };

  const renderCustomNode = ({ nodeDatum }) => (
    <g>
      <foreignObject x="-150" y="-50" width="500" height="700">
        <StyledNode level={nodeDatum.level}>{nodeDatum.name}</StyledNode>
      </foreignObject>
    </g>
  );

  return (
    <div className="check__task__by__self__container">
      <ClassAndMember />
      <div id="orgChart">
        <Tree
          data={treeData}
          orientation="horizontal"
          translate={{ x: 100, y: 100 }}
          nodeSize={{ x: 390, y: 150 }}
          separation={{ siblings: 1.5, nonSiblings: 2.5 }}
          zoomable={true}
          zoom={0.7}
          initialDepth={3}
          renderCustomNodeElement={renderCustomNode}
          pathFunc="diagonal"
          pathProps={{ stroke: "#007bff", strokeWidth: 2 }}
        />
      </div>
    </div>
  );
};

export default CheckTaskBySelf;
