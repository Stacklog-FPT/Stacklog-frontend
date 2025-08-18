import { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import GroupDropDown from '../GroupList/GroupDropDown';
import './ClassDropdown.scss';

const ClassDropdown = ({ showClasses, setShowClasses }) => {
  const classes = useSelector((state) => state.class.classes);
  const groups = useSelector((state) => state.group.groups);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const handleClassClick = (classId) => {
    setSelectedClassId(classId === selectedClassId ? null : classId);
  };

  return (
    <div className="class-dropdown">
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
      {showClasses && (
        <ul className="class-dropdown-menu">
          {classes.length > 0 ? (
            classes.map((classItem) => {
              const classGroups = groups.filter(
                (group) => group.classes_id === classItem.classes_id,
              );

              return (
                <li key={classItem.classes_id}>
                  <div
                    className="class-dropdown-item"
                    onClick={() => handleClassClick(classItem.classes_id)}
                  >
                    {classItem.classes_name}
                  </div>
                  {selectedClassId === classItem.classes_id && (
                    <GroupDropDown classId={classItem.classes_id} groups={classGroups} />
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
