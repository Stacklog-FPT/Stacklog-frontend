import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectClass } from '../../../redux/slice/semesterSlice';
import GroupDropDown from '../GroupList/GroupDropDown';
import './ClassDropDown.scss';

const ClassDropdown = ({ showClasses, setShowClasses, isSidebarOpen }) => {
  const { classes } = useSelector((state) => state.class);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  // Auto-expand class if URL contains groupId (supports both numeric and UUID)
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/tasks\/([a-zA-Z0-9-]+)/);
    if (pathMatch && pathMatch[1]) {
      const groupIdFromUrl = pathMatch[1];
      // Try to parse as number if it's numeric, otherwise keep as string
      const parsedGroupId = /^\d+$/.test(groupIdFromUrl) 
        ? parseInt(groupIdFromUrl, 10) 
        : groupIdFromUrl;
      
      setActiveGroupId(parsedGroupId);

      // Find which class contains this group
      const classWithGroup = classes.find((classItem) =>
        classItem.groups?.some((g) => String(g.groupsId) === String(parsedGroupId))
      );

      if (classWithGroup) {
        setSelectedClassId(classWithGroup.classesId);
        setShowClasses(true);
        dispatch(selectClass(classWithGroup.classesId));
      }
    } else {
      setActiveGroupId(null);
    }
  }, [location.pathname, classes, dispatch, setShowClasses]);

  const handleClassClick = (classId) => {
    setSelectedClassId(classId === selectedClassId ? null : classId);
    dispatch(selectClass(classId === selectedClassId ? null : classId));
  };

  // const handleGroupClick = (group) => {
  //   setShowClasses(false);
  //   setSelectedClassId(null);
  // };

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
            classes.map((classItem) => (
              <li key={classItem.classesId}>
                <div
                  className={`class-dropdown-item ${
                    selectedClassId === classItem.classesId ? 'active' : ''
                  }`}
                  onClick={() => handleClassClick(classItem.classesId)}
                  title={classItem.classesName}
                >
                  <i className="fa-regular fa-folder class-icon" />
                  <span className="class-name">{classItem.classesName}</span>
                </div>

                {selectedClassId === classItem.classesId && (
                  <GroupDropDown 
                    classId={classItem.classesId} 
                    groups={classItem.groups}
                    activeGroupId={activeGroupId}
                  />
                )}
              </li>
            ))
          ) : (
            <li className="class-dropdown-empty">No classes available</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ClassDropdown;
