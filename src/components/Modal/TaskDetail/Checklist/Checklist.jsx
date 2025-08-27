import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Checklist.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../../context/AuthProvider';
import { updateTaskApi } from '../../../../service/TaskService';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

const genId = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const normalize = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((cl, idx) => {
    const bid = cl.checkListId ?? `cl_${idx}`;
    return {
      id: `${String(bid)}__${idx}`,
      bid: String(bid),
      name: cl.checkListName ?? `Checklist ${idx + 1}`,
      items: (cl.checkItem || []).map((it, j) => ({
        id: String(it.checkItemId ?? `cli_${idx}_${j}`),
        bid: String(it.checkItemId ?? `cli_${idx}_${j}`),
        text: it.checkItemName ?? `Item ${j + 1}`,
        done: Boolean(it.done || it.completed),
      })),
    };
  });

const Checklist = ({ checkList = [], taskId }) => {
  const { user } = useAuth();
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.task);
  const { groups } = useSelector((state) => state.group);
  const currentGroup = groups?.find((g) => g.groupsId === groupId);
  const currentTask = tasks?.find((t) => String(t.taskId) === String(taskId)) || {};
  const source = useMemo(() => checkList ?? [], [checkList]);
  const initial = useMemo(() => normalize(source), [source]);
  const [lists, setLists] = useState(initial);
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(initial.map((l) => [l.id, true])),
  );
  const [newTitle, setNewTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [draftMap, setDraftMap] = useState({});
  const getDraft = (listId) => draftMap[listId] || { text: '', assignees: [] };
  const setDraftText = (listId, text) =>
    setDraftMap((m) => ({ ...m, [listId]: { ...getDraft(listId), text } }));
  const [assigneeOpen, setAssigneeOpen] = useState({});
  const toggleAssigneePanel = (listId) => setAssigneeOpen((m) => ({ ...m, [listId]: !m[listId] }));
  const toggleAssignee = (listId, userId) =>
    setDraftMap((m) => {
      const d = getDraft(listId);
      const exists = d.assignees?.includes(userId);
      const next = exists
        ? d.assignees.filter((x) => x !== userId)
        : [...(d.assignees || []), userId];
      return { ...m, [listId]: { ...d, assignees: next } };
    });

  const groupMembers = currentGroup?.groupStudent || [];
  useEffect(() => {
    const n = normalize(source);
    if (JSON.stringify(lists) !== JSON.stringify(n)) setLists(n);

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
  const serializeListsToPayload = (listsState) => ({
    ...currentTask,
    checkList: listsState.map((l) => ({
      checkListId: l.bid ?? l.id.split('__')[0],
      checkListName: l.name,
      checkItem: l.items.map((it) => ({
        checkItemId: it.bid ?? it.id,
        checkItemName: it.text,
        assignTo: it.assignTo || it.assignees || [],
      })),
    })),
  });

  const commitCreateChecklist = async () => {
    const title = newTitle.trim();
    if (!title || creatingList) {
      setNewTitle('');
      return;
    }

    setCreatingList(true);

    const newId = genId('cl');

    const optimistic = { id: newId, bid: newId, name: title, items: [] };
    setLists((prev) => [...prev, optimistic]);
    setOpenMap((prev) => ({ ...prev, [newId]: true }));
    setNewTitle('');

    try {
      const payload = serializeListsToPayload([...lists, optimistic]);
      await updateTaskApi(payload, user?.token, dispatch);
      toast.success('Checklist created successfully!');
    } catch (e) {
      setLists((prev) => prev.filter((l) => l.id !== newId));
      toast.error('Something went wrong!');
    } finally {
      setCreatingList(false);
    }
  };

  const commitCreateItem = async (listId) => {
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
    setLists(nextLists);
    setDraftMap((m) => ({ ...m, [listId]: { text: '', assignees: [] } }));

    try {
      const payload = serializeListsToPayload(nextLists);
      await updateTaskApi(payload, user?.token, dispatch);
      toast.success('Checkitem created successfully!');
    } catch (e) {
      setLists((prev) =>
        prev.map((l) =>
          l.id !== listId ? l : { ...l, items: l.items.filter((it) => it.id !== newItemId) },
        ),
      );
      toast.error('Something went wrong!');
    }
  };

  const toggleItemDone = (listId, itemId) =>
    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId
          ? l
          : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) },
      ),
    );

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
          disabled={creatingList}
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

            return (
              <section key={cl.id} className={`ck__section ${open ? 'is-open' : 'is-closed'}`}>
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

                <div className="ck__body" aria-hidden={!open}>
                  <div className="ck__rows">
                    {cl.items.map((it) => (
                      <label key={it.id} className={`ck__row ${it.done ? 'is-done' : ''}`}>
                        <input
                          type="checkbox"
                          checked={it.done}
                          onChange={() => toggleItemDone(cl.id, it.id)}
                        />
                        <span className="ck__text">{it.text}</span>
                      </label>
                    ))}

                    <div className="ck__addItem">
                      <div className="ck__chips">
                        {(getDraft(cl.id).assignees || []).map((uid) => (
                          <span key={uid} className="ck__chip" title={uid}>
                            {uid.slice(0, 6)}
                            <button
                              className="ck__chipX"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => toggleAssignee(cl.id, uid)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
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
                      />

                      <button
                        className="ck__assignBtn"
                        title="Choose assign"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleAssigneePanel(cl.id)}
                      >
                        +
                      </button>

                      {assigneeOpen[cl.id] && (
                        <div
                          className="ck__assigneePicker"
                          onMouseDown={(e) => e.preventDefault()}
                          onTouchStart={(e) => e.preventDefault()} // ✅ chặn blur khi chạm
                        >
                          {groupMembers.length === 0 ? (
                            <div className="ck__assigneeEmpty">The members are empty</div>
                          ) : (
                            groupMembers.map((uid) => {
                              const selected = getDraft(cl.id).assignees?.includes(uid);
                              const isLeader = uid === currentGroup?.groupsLeaderId;
                              return (
                                <button
                                  key={uid}
                                  className={`ck__assigneeItem ${selected ? 'is-selected' : ''}`}
                                  onClick={() => toggleAssignee(cl.id, uid)}
                                  title={uid}
                                >
                                  <span className="ck__avatar">
                                    {uid.slice(0, 2).toUpperCase()}
                                  </span>
                                  <span className="ck__assigneeName">{uid}</span>
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
