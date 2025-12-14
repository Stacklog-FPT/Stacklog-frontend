import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider';
import { useDispatch } from 'react-redux';
import { selectGroup } from '../../../redux/slice/semesterSlice';
import { canViewGroup } from '../../../helper/validateStudentGroup';
import decodeToken from '../../../service/DecodeJwt';
import './GroupDropDown.scss';

const GroupDropDown = ({ groups = [], activeGroupId }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  let userId = null;
  if (user?.token) {
    const decoded = decodeToken(user.token);
    userId = decoded?.id;
  }
  // ensure groups is an array (props may pass null explicitly)
  const safeGroups = Array.isArray(groups) ? groups : [];
  console.log(safeGroups);

  const userWithId = { ...user, userId };

  return (
    <ul className="group-dropdown">
      {safeGroups.length === 0 ? (
        <li className="group-empty">No groups</li>
      ) : (
        safeGroups.map((g) => {
          const isUnassigned =
            typeof g.groupsName === 'string' && g.groupsName.toLowerCase() === 'unassigned';
          const canView = isUnassigned || canViewGroup(userWithId, g);
          const isActive = String(activeGroupId) === String(g.groupsId);
          
          return (
            <li key={g.groupsId}>
              {canView ? (
                <NavLink
                  to={`/tasks/${g.groupsId}`}
                  className={({ isActive: navIsActive }) => 
                    `group-item ${navIsActive || isActive ? 'active' : ''}`
                  }
                  title={g.groupsName}
                  onClick={() => dispatch(selectGroup(g.groupsId))}
                >
                  <i className="fa-solid fa-user-group group-icon"></i>
                  <span className="group-name">{g.groupsName}</span>
                </NavLink>
              ) : (
                <div
                  className="group-item group-item--disabled"
                  title="You are not a member of this group"
                  tabIndex={-1}
                  aria-disabled="true"
                  style={{
                    pointerEvents: 'none',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}
                >
                  <i className="fa-solid fa-user-group group-icon"></i>
                  <span className="group-name">{g.groupsName}</span>
                </div>
              )}
            </li>
          );
        })
      )}
    </ul>
  );
};

export default GroupDropDown;
