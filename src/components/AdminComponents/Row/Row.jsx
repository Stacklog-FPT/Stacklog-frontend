// src/components/Row/Row.jsx
import React from "react";
import "./Row.scss";

const Row = ({ role, data }) => {
  if (!data) return null;

  switch (role) {
    case "Semester":
      return (
        <>
          <td>
            <input type="checkbox" />
          </td>
          <td>{data.semesterName || data.name}</td>
          <td>{data.semesterStartDate?.split("T")[0] || "N/A"}</td>
          <td>{data.semesterEndDate?.split("T")[0] || "N/A"}</td>
        </>
      );

    case "Class":
      return (
        <>
          <td>
            <input type="checkbox" />
          </td>
          <td>{data.classesName}</td>
          {/* <td>{data.semester?.semesterName || data.semester?.name || "N/A"}</td>
          <td>{data.lecture?.full_name || "No Lecturer"}</td> */}
        </>
      );

    case "Lecture":
      return (
        <>
          <td>
            <input type="checkbox" />
          </td>
          <td>
            <div className="name__ava">
              {data.avatar_link ? (
                <img src={data.avatar_link} alt="avatar" />
              ) : (
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  alt="default"
                />
              )}
              <p>{data.full_name}</p>
            </div>
          </td>
          <td className="text-note">{data.email}</td>
          <td>
            <span
              className={data.isActive ? "status-active" : "status-inactive"}
            >
              {data.isActive ? "Active" : "Inactive"}
            </span>
          </td>
        </>
      );

    case "Student":
      return (
        <>
          <td>
            <input type="checkbox" />
          </td>
          <td>
            <div className="name__ava">
              {data.avatar_link ? (
                <img src={data.avatar_link} alt="avatar" />
              ) : (
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  alt="default"
                />
              )}
              <p>{data.full_name}</p>
            </div>
          </td>
          <td className="text-note">{data.email}</td>
          <td>{data.class?.class_name || "No class"}</td>
        </>
      );

    default:
      return (
        <td colSpan="4" className="text-center">
          Not supported: {role}
        </td>
      );
  }
};

export default Row;
