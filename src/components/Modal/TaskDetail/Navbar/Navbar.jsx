import React from 'react';
import './Navbar.scss';

const Navbar = ({ active = 'subtasks', onChange, counts = {} }) => {
  const tabs = [
    { key: 'subtasks', label: 'Subtasks', count: counts.subtasks ?? 0 },
    { key: 'checklists', label: 'Checklists', count: counts.checklists ?? 0 },
    { key: 'reviews', label: 'Reviews', count: counts.reviews ?? 0 },
  ];

  return (
    <div className="tdnav" role="tablist" aria-label="Task sections">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`tdnav__btn ${active === t.key ? 'is-active' : ''}`}
          onClick={() => onChange?.(t.key)}
        >
          <span>{t.label}</span>
          <span className="tdnav__count">{t.count}</span>
        </button>
      ))}
    </div>
  );
};

export default Navbar;
