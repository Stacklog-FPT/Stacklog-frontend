import React, { useEffect, useMemo, useState } from 'react';
import './Checklist.scss';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';

const genId = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const isUUID = (s) =>
  typeof s === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const normalize = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((cl, idx) => {
    const bid = cl.checkListId ?? cl.id ?? `cl_${idx}`;
    const itemsSrc = cl.listItems ?? cl.checkItem ?? cl.items ?? [];
    return {
      id: `${String(bid)}__${idx}`, // id UI
      bid: String(bid), // id BE (nếu có)
      name: cl.checkListName ?? cl.name ?? `Checklist ${idx + 1}`,
      items: itemsSrc.map((it, j) => ({
        id: String(it.checkItemId ?? it.id ?? `cli_${idx}_${j}`), // id UI
        bid: String(it.checkItemId ?? it.id ?? ''), // id BE (nếu có)
        text: it.checkItemTitle ?? it.checkItemName ?? it.text ?? `Item ${j + 1}`,
        desc: it.checkItemDescription ?? it.description ?? '',
        due: it.checkItemDueDate ?? it.dueDate ?? null, // ISO string or null
        done: Boolean((it.isChecked ?? it.checkItemStatus ?? it.done) === true),
        assignTo: it.assignTo || [],
      })),
    };
  });

export const toApiShape = (listsState, { includeIds = true } = {}) =>
  (listsState || []).map((l) => {
    const base = {
      checkListName: l.name,
      listItems: (l.items || []).map((it) => {
        const itemBase = {
          checkItemTitle: it.text,
          checkItemDescription: it.desc ?? '',
          checkItemDueDate: it.due ?? null,
          isChecked: !!it.done,
        };
        return includeIds && isUUID(it.bid) ? { checkItemId: it.bid, ...itemBase } : itemBase;
      }),
    };
    return includeIds && isUUID(l.bid) ? { checkListId: l.bid, ...base } : base;
  });

// tiện key cho panel assign item
const itemKey = (listId, itemId) => `${listId}::${itemId}`;

const Checklist = ({ checkList = [], editTask = false, onChange, onDirtyChange }) => {
  // Group context
  const { groupId } = useParams();
  const { groups } = useSelector((state) => state.group);
  const currentGroup = groups?.find((g) => g.groupsId === groupId);
  const groupMembers = currentGroup?.groupStudent || [];

  // nguồn & state
  const source = useMemo(() => checkList ?? [], [checkList]);
  const initial = useMemo(() => normalize(source), [source]);

  const [lists, setLists] = useState(initial);
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(initial.map((l) => [l.id, true])),
  );

  // Inline edit
  const [nameEdit, setNameEdit] = useState({ listId: null, value: '' });
  const [itemEdit, setItemEdit] = useState({ listId: null, itemId: null, value: '' });

  // Create checklist/item
  const [newTitle, setNewTitle] = useState('');
  const [draftMap, setDraftMap] = useState({});
  const getDraft = (listId) => draftMap[listId] || { text: '', assignees: [] };
  const setDraftText = (listId, text) =>
    setDraftMap((m) => ({ ...m, [listId]: { ...getDraft(listId), text } }));

  // Assignee: list-level (để tạo item) & item-level (để sửa item đã tồn tại)
  const [assigneeOpen, setAssigneeOpen] = useState({});
  const toggleAssigneePanel = (listId) => setAssigneeOpen((m) => ({ ...m, [listId]: !m[listId] }));

  const [itemAssigneeOpen, setItemAssigneeOpen] = useState({});
  const toggleItemAssigneePanel = (listId, itemId) =>
    setItemAssigneeOpen((m) => {
      const k = itemKey(listId, itemId);
      return { ...m, [k]: !m[k] };
    });
  const closeItemAssigneePanel = (listId, itemId) =>
    setItemAssigneeOpen((m) => ({ ...m, [itemKey(listId, itemId)]: false }));

  const normMember = (u) =>
    typeof u === 'string'
      ? { id: u, name: u, avatar: null }
      : {
          id: u?.id ?? u?._id ?? u?.userId ?? String(u),
          name: u?.name ?? u?.username ?? String(u),
          avatar: u?.avatar ?? null,
        };

  useEffect(() => {
    const n = normalize(source);
    setLists(n);
    setOpenMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const l of n)
        if (!(l.id in next)) {
          next[l.id] = true;
          changed = true;
        }
      for (const k of Object.keys(next))
        if (!n.some((l) => l.id === k)) {
          delete next[k];
          changed = true;
        }
      return changed ? next : prev;
    });
    setDraftMap({});
    setNameEdit({ listId: null, value: '' });
    setItemEdit({ listId: null, itemId: null, value: '' });
    setAssigneeOpen({});
    setItemAssigneeOpen({});
    onDirtyChange?.(false);
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

  const toggleOpen = (listId) => setOpenMap((m) => ({ ...m, [listId]: !m[listId] }));

  const commitLocal = (nextLists) => {
    setLists(nextLists);
    onChange?.(nextLists);
    onDirtyChange?.(true);
  };

  // tạo checklist
  const commitCreateChecklist = () => {
    if (!editTask) return;
    const title = newTitle.trim();
    if (!title) return;

    const newId = genId('cl');
    const optimistic = { id: newId, bid: newId, name: title, items: [] };
    commitLocal([...lists, optimistic]);
    setOpenMap((prev) => ({ ...prev, [newId]: true }));
    setNewTitle('');
  };

  // tạo item
  const commitCreateItem = (listId) => {
    if (!editTask) return;
    const draft = getDraft(listId);
    const text = draft.text.trim();
    const assignees = draft.assignees || [];
    if (!text) return;

    const newItemId = genId('cli');
    const nextLists = lists.map((l) =>
      l.id !== listId
        ? l
        : {
            ...l,
            items: [
              ...l.items,
              { id: newItemId, bid: newItemId, text, done: false, assignTo: assignees },
            ],
          },
    );
    commitLocal(nextLists);
    setDraftMap((m) => ({ ...m, [listId]: { text: '', assignees: [] } }));
  };

  // check done
  const toggleItemDone = (listId, itemId) => {
    if (!editTask) return;
    const nextLists = lists.map((l) =>
      l.id !== listId
        ? l
        : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) },
    );
    commitLocal(nextLists);
  };

  // rename checklist
  const startEditListName = (list) => {
    if (!editTask) return;
    setNameEdit({ listId: list.id, value: list.name });
  };
  const saveListName = () => {
    const { listId, value } = nameEdit;
    if (!listId) return;
    const next = lists.map((l) => (l.id === listId ? { ...l, name: value.trim() || l.name } : l));
    commitLocal(next);
    setNameEdit({ listId: null, value: '' });
  };
  const cancelListName = () => setNameEdit({ listId: null, value: '' });

  // rename item
  const startEditItem = (listId, item) => {
    if (!editTask) return;
    setItemEdit({ listId, itemId: item.id, value: item.text });
  };
  const saveItemText = () => {
    const { listId, itemId, value } = itemEdit;
    if (!listId || !itemId) return;
    const next = lists.map((l) =>
      l.id !== listId
        ? l
        : {
            ...l,
            items: l.items.map((it) =>
              it.id === itemId ? { ...it, text: value.trim() || it.text } : it,
            ),
          },
    );
    commitLocal(next);
    setItemEdit({ listId: null, itemId: null, value: '' });
  };
  const cancelItemText = () => setItemEdit({ listId: null, itemId: null, value: '' });

  // delete
  const deleteChecklist = (listId) => {
    if (!editTask) return;
    const next = lists.filter((l) => l.id !== listId);
    commitLocal(next);
  };
  const deleteItem = (listId, itemId) => {
    if (!editTask) return;
    const next = lists.map((l) =>
      l.id !== listId ? l : { ...l, items: l.items.filter((it) => it.id !== itemId) },
    );
    commitLocal(next);
  };

  // toggle assign của item đã có
  const toggleItemAssignee = (listId, itemId, userId) => {
    if (!editTask) return;
    const next = lists.map((l) =>
      l.id !== listId
        ? l
        : {
            ...l,
            items: l.items.map((it) =>
              it.id !== itemId
                ? it
                : {
                    ...it,
                    assignTo: (it.assignTo || []).includes(userId)
                      ? it.assignTo.filter((u) => u !== userId)
                      : [...(it.assignTo || []), userId],
                  },
            ),
          },
    );
    commitLocal(next);
  };

  return (
    <div className="ck">
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

      {/* tạo checklist (chỉ enable khi edit) */}
      <div className="ck__inlineCreate">
        <input
          placeholder="New Check List"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={commitCreateChecklist}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitCreateChecklist();
            if (e.key === 'Escape') setNewTitle('');
          }}
          disabled={!editTask}
        />
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
            const isEditingName = nameEdit.listId === cl.id;

            return (
              <section key={cl.id} className={`ck__section ${open ? 'is-open' : 'is-closed'}`}>
                <button className="ck__head" onClick={() => toggleOpen(cl.id)}>
                  <span className={`ck__chev ${open ? 'open' : ''}`}>›</span>

                  {/* Tên checklist */}
                  <strong
                    className="ck__name"
                    title={cl.name}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditListName(cl);
                    }}
                  >
                    {isEditingName && editTask ? (
                      <input
                        className="ck__nameInput"
                        value={nameEdit.value}
                        autoFocus
                        onChange={(e) => setNameEdit((s) => ({ ...s, value: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveListName();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelListName();
                          }
                        }}
                        onBlur={saveListName}
                      />
                    ) : (
                      <>{cl.name}</>
                    )}
                  </strong>

                  {editTask && !isEditingName && (
                    <>
                      <button
                        className="ck__renameBtn"
                        title="Rename checklist"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditListName(cl);
                        }}
                      >
                        ✎
                      </button>

                      <button
                        className="ck__trashBtn"
                        title="Delete checklist"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChecklist(cl.id);
                        }}
                        aria-label={`Delete checklist ${cl.name}`}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}

                  <span className="ck__mini">
                    {done}/{total}
                  </span>
                  <div className="ck__miniBar">
                    <div className="ck__miniBar__fill" style={{ width: `${pct}%` }} />
                  </div>
                </button>

                <div className="ck__body" aria-hidden={!open}>
                  <div className="ck__rows">
                    {cl.items.map((it) => {
                      const isEditingItem = itemEdit.listId === cl.id && itemEdit.itemId === it.id;
                      const k = itemKey(cl.id, it.id);
                      return (
                        <label key={it.id} className={`ck__row ${it.done ? 'is-done' : ''}`}>
                          <input
                            type="checkbox"
                            checked={it.done}
                            onChange={() => toggleItemDone(cl.id, it.id)}
                            disabled={!editTask}
                          />

                          {/* Text item */}
                          {isEditingItem && editTask ? (
                            <input
                              className="ck__itemInput"
                              value={itemEdit.value}
                              autoFocus
                              onChange={(e) =>
                                setItemEdit((s) => ({ ...s, value: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveItemText();
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelItemText();
                                }
                              }}
                              onBlur={saveItemText}
                            />
                          ) : (
                            <span
                              className="ck__text"
                              onDoubleClick={() => startEditItem(cl.id, it)}
                              title="Double click to rename"
                            >
                              {it.text}
                            </span>
                          )}

                          {/* Assignees hiện ngay trên item */}
                          <div className="ck__itemAssign" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="ck__chips">
                              {(it.assignTo || []).map((uidRaw) => {
                                const m = normMember(uidRaw);
                                return (
                                  <span key={m.id} className="ck__chip" title={m.name}>
                                    {m.avatar ? (
                                      <img src={m.avatar} alt={m.name} />
                                    ) : (
                                      m.name.slice(0, 2).toUpperCase()
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* nút rename / trash item */}
                          {editTask && !isEditingItem && (
                            <div className="ck__rowBtns">
                              <button
                                type="button"
                                className="ck__itemRenameBtn"
                                title="Rename item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  startEditItem(cl.id, it);
                                }}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="ck__itemTrashBtn"
                                title="Delete item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteItem(cl.id, it.id);
                                }}
                                aria-label={`Delete item ${it.text}`}
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          )}
                        </label>
                      );
                    })}

                    {/* Add item row */}
                    <div className="ck__addItem">
                      <div className="ck__chips">
                        {(getDraft(cl.id).assignees || []).map((uid) => {
                          const m = normMember(uid);
                          return (
                            <span key={m.id} className="ck__chip" title={m.name}>
                              {m.avatar ? (
                                <img src={m.avatar} alt={m.name} />
                              ) : (
                                m.name.slice(0, 2).toUpperCase()
                              )}
                              <button
                                className="ck__chipX"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                  setDraftMap((mm) => ({
                                    ...mm,
                                    [cl.id]: {
                                      ...getDraft(cl.id),
                                      assignees: (getDraft(cl.id).assignees || []).filter(
                                        (x) => normMember(x).id !== m.id,
                                      ),
                                    },
                                  }))
                                }
                                disabled={!editTask}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      <input
                        className="ck__addInput"
                        placeholder="Add check item"
                        value={getDraft(cl.id).text}
                        onChange={(e) => setDraftText(cl.id, e.target.value)}
                        onBlur={() => commitCreateItem(cl.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitCreateItem(cl.id);
                          if (e.key === 'Escape')
                            setDraftMap((m) => ({ ...m, [cl.id]: { text: '', assignees: [] } }));
                        }}
                        disabled={!editTask}
                      />

                      <button
                        className="ck__assignBtn"
                        title="Choose assign"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editTask && toggleAssigneePanel(cl.id)}
                        disabled={!editTask}
                      >
                        +
                      </button>

                      {assigneeOpen[cl.id] && editTask && (
                        <div
                          className="ck__assigneePicker"
                          onMouseDown={(e) => e.preventDefault()}
                          onTouchStart={(e) => e.preventDefault()}
                        >
                          {groupMembers.length === 0 ? (
                            <div className="ck__assigneeEmpty">The members are empty</div>
                          ) : (
                            groupMembers.map((gm) => {
                              const m = normMember(gm);
                              const selected = getDraft(cl.id).assignees?.some(
                                (x) => normMember(x).id === m.id,
                              );
                              const isLeader = m.id === currentGroup?.groupsLeaderId;
                              return (
                                <button
                                  key={m.id}
                                  className={`ck__assigneeItem ${selected ? 'is-selected' : ''}`}
                                  onClick={() =>
                                    setDraftMap((mm) => {
                                      const d = getDraft(cl.id);
                                      const exists = d.assignees?.some(
                                        (x) => normMember(x).id === m.id,
                                      );
                                      const next = exists
                                        ? d.assignees.filter((x) => normMember(x).id !== m.id)
                                        : [...(d.assignees || []), m.id];
                                      return { ...mm, [cl.id]: { ...d, assignees: next } };
                                    })
                                  }
                                  title={m.name}
                                >
                                  <span className="ck__avatar">
                                    {m.avatar ? (
                                      <img src={m.avatar} alt={m.name} />
                                    ) : (
                                      m.name.slice(0, 2).toUpperCase()
                                    )}
                                  </span>
                                  <span className="ck__assigneeName">{m.name}</span>
                                  {isLeader && <span className="ck__tag">Leader</span>}
                                  {selected && <span className="ck__check">✓</span>}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
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
