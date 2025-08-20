import { NavLink } from 'react-router-dom';
import './GroupDropDown.scss';

const GroupDropDown = ({ groups = [] }) => {
  return (
    <ul className="group-dropdown">
      {groups.length === 0 ? (
        <li className="group-empty">No groups</li>
      ) : (
        groups.map((g) => (
          <li key={g.groups_id}>
            <NavLink
              to={`/tasks/${g.groups_id}`}
              type="button"
              className="group-item"
              title={g.groups_name}
            >
              {g.groups_name}
            </NavLink>
          </li>
        ))
      )}
    </ul>
  );
};

export default GroupDropDown;
