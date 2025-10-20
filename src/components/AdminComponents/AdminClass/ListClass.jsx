import React from "react";

const ListClass = () => {
  return (
    <div className="list__semester__container">
      <div className="list__semester">
        <div className="list__semester__heading">
          <div className="list__semester__heading__title">
            <h2>Manage Class</h2>
          </div>

          <div className="list__semester__heading__feature">
            <i className="fa-solid fa-filter"></i>
            <i
              className="fa-solid fa-plus"
              onClick={() => setIsShowAdd(!isShowAdd)}
            ></i>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
        <div className="list__semester__table">
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
            <tbody>
              {/* {currentItems.length > 0 ? (
                  currentItems.map((item) => {
                    return (
                      <tr key={item._id} className="list__task__table__item">
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <div className="name__ava">
                            {item?.avatar_link ? (
                              <img src={item?.avatar_link} />
                            ) : (
                              <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
                            )}
                            <p>{item.full_name}</p>
                          </div>
                        </td>
                        <td className="text-note">{item.email}</td>
                        <td>
                          <span>{item.isActive ? "Active" : "Inactive"}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Lecture will coming soon, don't worry
                    </td>
                  </tr>
                )} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListClass;
