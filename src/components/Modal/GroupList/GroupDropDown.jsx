import { NavLink } from 'react-router-dom';
import './GroupDropDown.scss';

const GroupDropDown = ({ groups = [] }) => {
  return (
    <ul className="group-dropdown">
      {groups.length === 0 ? (
        <li className="group-empty">No groups</li>
      ) : (
        groups.map((g) => (
          <li key={g.groupsId}>
            <NavLink
              to={`/tasks/${g.groupsId}`}
              type="button"
              className="group-item"
              title={g.groupsName}
            >
              {g.groupsName}
            </NavLink>
          </li>
        ))
      )}
    </ul>
  );
};

export default GroupDropDown;
