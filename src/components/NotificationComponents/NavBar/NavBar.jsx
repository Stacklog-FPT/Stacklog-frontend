import React from 'react';
import './NavBar.scss';
const NavBar = (props) => {
  const listRef = React.useRef(null);
  const itemRefs = React.useRef({});
  const indicatorRef = React.useRef(null);

  const moveIndicator = React.useCallback(() => {
    const list = listRef.current;
    const ind = indicatorRef.current;
    const btn = itemRefs.current[props.active];
    if (!list || !ind || !btn) return;

    const listRect = list.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const left = btnRect.left - listRect.left;
    const width = btnRect.width;

    ind.style.setProperty('--indicator-left', `${left}px`);
    ind.style.setProperty('--indicator-width', `${width}px`);
  }, [props.active]);

  React.useEffect(() => {
    moveIndicator();
    window.addEventListener('resize', moveIndicator);
    return () => window.removeEventListener('resize', moveIndicator);
  }, [moveIndicator]);

  return (
    <div className="navbar">
      <div className="navbar__container">
        <ul className="navbar__list" ref={listRef} role="tablist" aria-label="Notifications filter">
          {props.features.map((f) => (
            <li className="nav-item" key={f.id}>
              <button
                ref={(el) => {
                  if (el) itemRefs.current[f.label] = el;
                }}
                className={`nav-btn ${props.active === f.label ? 'is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={props.active === f.label}
                onClick={() => props.setActive(f.label)}
              >
                <span className="nav-icon">{f.icon}</span>
                <span className="nav-label">{f.label}</span>
              </button>
            </li>
          ))}
          <span className="navbar__baseline" aria-hidden="true" />
          <span className="navbar__indicator" ref={indicatorRef} aria-hidden="true" />
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
