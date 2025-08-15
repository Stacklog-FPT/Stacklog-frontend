import { NavLink } from 'react-router-dom';
import './GroupDropDown.scss';

const GroupDropDown = ({ groups = [], onGroupClick }) => {
  return (
    <ul className="group-dropdown">
      {groups.length === 0 ? (
        <li className="group-empty">No groups</li>
      ) : (
        groups.map((g) => (
          <li key={g.groups_id}>
            <NavLink
              type="button"
              className="group-item"
              onClick={() => onGroupClick?.(g)}
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
