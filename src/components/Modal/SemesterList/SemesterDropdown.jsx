import { useEffect, useMemo, useRef, useState } from 'react';
import './SemesterDropdown.scss';
const normalizeSemesters = (arr = []) =>
  arr
    .map((s) => ({
      id: s.semester_id ?? s.semesterId,
      name: s.semester_name ?? s.semesterName ?? s.name ?? 'Unnamed semester',
    }))
    .filter((x) => Boolean(x.id));

const SemesterDropdown = ({ semesters = [], value, onChange, placeholder = 'Select semester' }) => {
  const items = useMemo(() => normalizeSemesters(semesters), [semesters]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = items.find((it) => it.id === value) || null;

  const toggle = () => setOpen((p) => !p);
  const close = () => setOpen(false);

  const handleSelect = (id) => {
    onChange?.(id);
    close();
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="semester-dropdown" ref={ref}>
      <button className={`sd-trigger ${open ? 'open' : ''}`} onClick={toggle} type="button">
        <span className="sd-label">{selected ? selected.name : placeholder}</span>
        <i className={`fa-solid fa-chevron-down sd-caret ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="sd-menu">
          {items.length === 0 ? (
            <div className="sd-empty">No semesters</div>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                type="button"
                className={`sd-item ${value === it.id ? 'active' : ''}`}
                onClick={() => handleSelect(it.id)}
                title={it.name}
              >
                <span className="sd-item-text">{it.name}</span>
                {value === it.id && <i className="fa-solid fa-check sd-check" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SemesterDropdown;
