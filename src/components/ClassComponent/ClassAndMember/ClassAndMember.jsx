import React, { useState, useEffect } from "react";
import "./ClassAndMember.scss";
import avatar_add_button from "../../../assets/icon/avatar_add_button.png";
import iconFilter from "../../../assets/icon/task/iconFilter.png";
import iconMore from "../../../assets/icon/task/iconMore.png";
import ClassService from "../../../service/ClassService";
import GroupService from "../../../service/GroupService";
import { useAuth } from "../../../context/AuthProvider";
import useApi from "../../../service/UserService";
import decodeToken from "../../../service/DecodeJwt";
import { ClockLoader } from "react-spinners";

const ClassAndMember = ({ onFilterByPriority, setGroup, setMemberTask }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [memberList, setMemberList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const visibleMembers = memberList?.slice(0, 3);
  const extraCount = memberList?.length - visibleMembers?.length;
  const { getUserById } = useApi();

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const classService = ClassService();
        const data = await classService.getMembersInClass(user.token);
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].classesId);
          setGroups(data[0].groups);
        }
      } catch (err) {
        setClasses([]);
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;

    setIsLoading(true);
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    setGroups(foundClass ? foundClass.groups : []);
    setSelectedGroup("all");
    setIsLoading(false);
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!selectedClass) return;

    setIsLoading(true);
    const foundClass = classes.find((c) => c.classesId === selectedClass);
    let userIds = [];
    if (foundClass) {
      setGroup(selectedGroup);
      if (selectedGroup === "all") {
        foundClass.groups.forEach((group) => {
          group.groupStudents.forEach((student) => {
            userIds.push(student.userId);
          });
        });
      } else {
        const group = foundClass.groups.find(
          (g) => g.groupsId === selectedGroup
        );
        if (group) {
          userIds = group.groupStudents.map((s) => s.userId);
        }
      }
    }
    userIds = [...new Set(userIds)];
    const fetchStudents = async () => {
      try {
        const studentInfos = await Promise.all(
          userIds.map(async (id) => {
            try {
              const u = await getUserById(user.token, id);
              return {
                _id: u._id,
                name: u.full_name,
                email: u.email,
                id: u.work_id,
                avatar: u.avatar_link,
              };
            } catch {
              return null;
            }
          })
        );
        setMemberList(studentInfos.filter(Boolean));
        setMemberTask(studentInfos.filter(Boolean));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass, selectedGroup, classes, user, setGroup]);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    const selected = classes.find((c) => c.classesId === classId);
    setGroups(selected ? selected.groups : []);
    setSelectedGroup("all");
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  return (
    <>
      <div className={`spinner-overlay ${isLoading ? "open" : ""}`}>
        <ClockLoader
          loading={isLoading}
          size={200}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      <div className="class__and__member__container">
        <div className="class__and__member__content__member">
          <div className="class__and__member__content__member__class">
            <select value={selectedClass} onChange={handleClassChange}>
              <option value="" disabled>
                -- Choose Class --
              </option>
              {classes?.map((item) => (
                <option key={item?.classesId} value={item?.classesId}>
                  {item?.classesName}
                </option>
              ))}
            </select>

            <select value={selectedGroup} onChange={handleGroupChange}>
              <option value="all">All Groups</option>
              {groups?.map((item) => (
                <option key={item?.groupsId} value={item?.groupsId}>
                  {item?.groupsName}
                </option>
              ))}
            </select>
          </div>
          <div className="class__and__member__content__member__student">
            <ul
              className="class__and__member__content__member__student__list"
              data-extra-count={extraCount > 0 ? extraCount : ""}
            >
              {visibleMembers?.map((item) => (
                <li key={item._id}>
                  <img
                    src={item.avatar}
                    alt={`${item.name}'s Avatar`}
                    title={item.name}
                    onError={(e) =>
                      (e.target.src =
                        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                    }
                  />
                </li>
              ))}
              {extraCount > 0 && (
                <li className="extra-count">
                  <span>+{extraCount}</span>
                </li>
              )}
            </ul>
            <div className="class__and__member__content__member__button-add">
              <img src={avatar_add_button} alt="add_button_icon" />
              <img
                src={iconFilter}
                alt="filter_button_icon"
                onClick={onFilterByPriority}
                style={{ cursor: "pointer" }}
              />
              <img src={iconMore} alt="more_button_icon" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassAndMember;
