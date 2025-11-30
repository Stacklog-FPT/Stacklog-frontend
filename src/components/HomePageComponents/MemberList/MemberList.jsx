import React from "react";
import "./MemberList.scss";
import { useSelector } from "react-redux";
import { useAuth } from "../../../context/AuthProvider";
import { fetchUserById } from "../../../service/UserService";
const MemberList = () => {
  const { user } = useAuth();
  const classes = useSelector((state) => state.class.classes);
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [selectedGroupId, setSelectedGroupId] = React.useState("");
  const selectedClass = classes.find(
    (cls) => cls.classesId === selectedClassId
  );
  const [members, setMemebers] = React.useState([]);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = members.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  React.useEffect(() => {
    const fetchStudent = async () => {
      setMemebers([]);

      if (!selectedClassId || !selectedGroupId) {
        return;
      }

      const currentClass = classes.find(
        (cls) => cls.classesId === selectedClassId
      );
      const currentGroup = currentClass?.groups.find(
        (gr) => gr.groupsId === selectedGroupId
      );

      if (
        !currentGroup?.groupStudent ||
        currentGroup.groupStudent.length === 0
      ) {
        setMemebers([]);
        return;
      }

      const userIds = currentGroup.groupStudent;

      try {
        const studentInfos = await Promise.all(
          userIds.map(async (id) => {
            try {
              const u = await fetchUserById(user.token, id);
              if (!u?._id) return null;
              return {
                _id: u._id,
                name: u.full_name || "Unknown",
                avatar: u.avatar_link || "",
              };
            } catch (err) {
              console.warn("User not found or error:", id, err);
              return null;
            }
          })
        );

        setMemebers(studentInfos.filter(Boolean));
      } catch (error) {
        console.error("Error fetching students:", error);
        setMemebers([]);
      }
    };

    fetchStudent();
  }, [selectedGroupId, selectedClassId, user?.token, classes]);

  return (
    <div className="member__list">
      <div className="member__list__container">
        <div className="member__list__heading">
          <div className="member__list__heading__title">
            <h2>Member List</h2>
          </div>

          <div className="member__list__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="member__list__feature">
          <div className="member__list__feature__filter">
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedGroupId("");
              }}
            >
              <option>Select class</option>
              {classes.map((item) => (
                <option key={item.classesId} value={item.classesId}>
                  {item.classesName}
                </option>
              ))}
            </select>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Chọn nhóm</option>
              {selectedClass?.groups?.map((group) => (
                <option key={group.groupsId} value={group.groupsId}>
                  {group.groupsName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="member__list__table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Student</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                return (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="name__ava">
                        {item?.avatar ? (
                          <img src={item?.avatar} />
                        ) : (
                          <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
                        )}

                        <p>{item.full_name}</p>
                      </div>
                    </td>

                    <td className="text-note">{item.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination">
        {members.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="pagination__button"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="pagination__info">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination__button"
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;
