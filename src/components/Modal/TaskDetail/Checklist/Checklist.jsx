import React, { useEffect, useMemo, useState } from 'react';
import './Checklist.scss';

const normalize = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((cl, idx) => ({
    id: String(cl.checkListId ?? `cl_${idx}`) + `__${idx}`,
    name: cl.checkListName ?? `Checklist ${idx + 1}`,
    items: (cl.checkItem || []).map((it, j) => ({
      id: String(it.checkItemId ?? `cli_${idx}_${j}`),
      text: it.checkItemName ?? `Item ${j + 1}`,
      done: Boolean(it.done || it.completed),
    })),
  }));

const Checklist = (props = {}) => {
  const source = props.data || [];

  const initial = useMemo(() => normalize(source), [source]);
  const [lists, setLists] = useState(initial);
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(initial.map((l) => [l.id, true])),
  );

  useEffect(() => {
    const n = normalize(source);
    setLists(n);

    setOpenMap((prev) =>
      n.reduce((acc, l) => {
        acc[l.id] = prev[l.id] ?? true;
        return acc;
      }, {}),
    );
  }, [source]);

  const totals = lists.reduce(
    (acc, l) => {
      acc.total += l.items.length;
      acc.done += l.items.filter((i) => i.done).length;
      return acc;
    },
    { done: 0, total: 0 },
  );
  const overallPct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  const toggleOpen = (listId) =>
    setOpenMap((m) => ({
      ...m,
      [listId]: !m[listId],
    }));

  const toggleItem = (listId, itemId) =>
    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId
          ? l
          : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) },
      ),
    );

  const [addingFor, setAddingFor] = useState(null);
  const [draft, setDraft] = useState('');
  const startAdd = (listId) => {
    setAddingFor(listId);
    setDraft('');
  };
  const cancelAdd = () => {
    setAddingFor(null);
    setDraft('');
  };
  const confirmAdd = () => {
    if (!draft.trim()) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id !== addingFor
          ? l
          : {
              ...l,
              items: [
                ...l.items,
                { id: `cli_${l.id}_${Date.now()}`, text: draft.trim(), done: false },
              ],
            },
      ),
    );
    cancelAdd();
  };

  return (
    <div className="ck">
      {/* Toolbar tổng */}
      <div className="ck__toolbar">
        <h3>Checklists</h3>
        <div className="ck__overall">
          <div className="ck__bar">
            <div className="ck__bar__fill" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="ck__count">
            {totals.done}/{totals.total}
          </span>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="ck__empty">No data available</div>
      ) : (
        <div className="ck__list">
          {lists.map((cl) => {
            const done = cl.items.filter((i) => i.done).length;
            const total = cl.items.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const open = !!openMap[cl.id];

            return (
              <section key={cl.id} className={`ck__section ${open ? 'is-open' : 'is-closed'}`}>
                {/* Header checklist */}
                <button className="ck__head" onClick={() => toggleOpen(cl.id)}>
                  <span className={`ck__chev ${open ? 'open' : ''}`}>›</span>
                  <strong className="ck__name" title={cl.name}>
                    {cl.name}
                  </strong>
                  <span className="ck__mini">
                    {done}/{total}
                  </span>
                  <div className="ck__miniBar">
                    <div className="ck__miniBar__fill" style={{ width: `${pct}%` }} />
                  </div>
                </button>

                {/* Body checklist (accordion mượt) */}
                <div className="ck__body" aria-hidden={!open}>
                  <div className="ck__rows">
                    {cl.items.map((it) => (
                      <label key={it.id} className={`ck__row ${it.done ? 'is-done' : ''}`}>
                        <input
                          type="checkbox"
                          checked={it.done}
                          onChange={() => toggleItem(cl.id, it.id)}
                        />
                        <span className="ck__text">{it.text}</span>
                      </label>
                    ))}

                    {/* Add item */}
                    {addingFor === cl.id ? (
                      <div className="ck__row is-editing">
                        <span className="ck__plus">+</span>
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="New checklist item"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmAdd();
                            if (e.key === 'Escape') cancelAdd();
                          }}
                          autoFocus
                        />
                        <div className="ck__actions">
                          <button className="btn small" onClick={confirmAdd}>
                            Add
                          </button>
                          <button className="btn small ghost" onClick={cancelAdd}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="ck__row add" onClick={() => startAdd(cl.id)}>
                        <span className="ck__plus">+</span>
                        <span className="ck__muted">New checklist item</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Checklist;
