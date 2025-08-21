import { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import GroupDropDown from '../GroupList/GroupDropDown';
import './ClassDropdown.scss';

const ClassDropdown = ({ showClasses, setShowClasses, isSidebarOpen }) => {
  const classes = useSelector((state) => state.class.classes);
  const groups = useSelector((state) => state.group.groups);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const handleClassClick = (classId) => {
    setSelectedClassId(classId === selectedClassId ? null : classId);
  };

  const handleGroupClick = (group) => {
    setShowClasses(false);
    setSelectedClassId(null);
  };

  return (
    <div className={`class-dropdown ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <div className="class-dropdown-toggle" onClick={() => setShowClasses(!showClasses)}>
        <div className="nav-icon-container">
          <div className="nav-icon-container-inner">
            <i className="fa-solid fa-users"></i>
            <span className="nav-icon-container-text">Class</span>
          </div>
          <div className={`arrow-transition ${showClasses ? 'rotated' : ''}`}>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>
      {showClasses && isSidebarOpen && (
        <ul className="class-dropdown-menu">
          {classes.length > 0 ? (
            classes.map((classItem) => {
              return (
                <li key={classItem.classesId}>
                  <div
                    className="class-dropdown-item"
                    onClick={() => handleClassClick(classItem.classesId)}
                  >
                    {classItem.classesName}
                  </div>
                  {selectedClassId === classItem.classesId && (
                    <GroupDropDown classId={classItem.classesId} groups={classItem.groups} />
                  )}
                </li>
              );
            })
          ) : (
            <li className="class-dropdown-empty">No classes available</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ClassDropdown;
