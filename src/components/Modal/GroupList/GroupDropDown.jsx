import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider';
import { canViewGroup } from '../../../helper/validateStudentGroup';
import decodeToken from '../../../service/DecodeJwt';
import './GroupDropDown.scss';

const GroupDropDown = ({ groups = [] }) => {
  const { user } = useAuth();
  let userId = null;
  if (user?.token) {
    const decoded = decodeToken(user.token);
    userId = decoded?.id;
  }
  console.log(groups);
  const userWithId = { ...user, userId };
  console.log(userWithId);

  return (
    <ul className="group-dropdown">
      {groups.length === 0 ? (
        <li className="group-empty">No groups</li>
      ) : (
        groups.map((g) => {
          const canView = canViewGroup(userWithId, g);
          return (
            <li key={g.groupsId}>
              {canView ? (
                <NavLink to={`/tasks/${g.groupsId}`} className="group-item" title={g.groupsName}>
                  <i className="fa-solid fa-user-group group-icon"></i>
                  <span className="group-name">{g.groupsName}</span>
                </NavLink>
              ) : (
                <div
                  className="group-item group-item--disabled"
                  title="Bạn không thuộc nhóm này"
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
