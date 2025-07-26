import React from "react";
import "./ListLecture.scss";
import { useAuth } from "../../../context/AuthProvider";
import userApi from "../../../service/UserService";
const ListLecture = () => {
  const [lectures, setLectures] = React.useState([]);
  const { user } = useAuth();
  const { getUserByRole } = userApi();
  const handleGetLectures = async () => {
    const resp = await getUserByRole(user?.token, "lecture");
    if (resp) {
      setLectures(resp);
    }
  };

  React.useEffect(() => {
    handleGetLectures();
  }, []);
  return (
    <div className="list__lecture__container">
      <div className="list__lecture">
        <div className="list__lecture__heading">
          <div className="list__lecture__heading__title">
            <h2>Manage Lecture</h2>
          </div>

          <div className="list__lecture__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i className="fa-solid fa-plus"></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="list__lecture__table">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Lecture</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListLecture;
