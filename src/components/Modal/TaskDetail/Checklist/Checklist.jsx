import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import './Checklist.scss';
import { updateTaskApi } from '../../../../service/TaskService';
import { useAuth } from '../../../../context/AuthProvider';
import { useDispatch } from 'react-redux';

const Checklist = ({ checkList, task }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [isAddingList, setIsAddingList] = React.useState(false);
  const [newCheckListName, setNewCheckListName] = React.useState('');
  const [activeId, setActiveId] = React.useState(null);
  const [newItem, setNewItem] = React.useState('');

  const toggleAddItemRow = (checkListId) => {
    setActiveId((prev) => (String(prev) === String(checkListId) ? null : checkListId));
    setNewItem('');
  };

  const handleAddChecklist = async () => {
    const name = newCheckListName.trim();
    if (!name) return;

    const newChecklist = {
      // checkListId: Math.random().toString(16).slice(2, 6),
      checkListName: name,
      listItems: [],
    };

    const current = Array.isArray(task.checkLists) ? task.checkLists : [];
    const payload = { ...task, checkLists: [...current, newChecklist] };
    console.log('payload: ', payload);
    await updateTaskApi(payload, user.token, dispatch);
    setNewCheckListName('');
    setIsAddingList(false);
  };

  const handleDeleteChecklist = async (checkListId) => {
    const updatedCheckLists = (task.checkLists || []).filter(
      (cl) => String(cl.checkListId) !== String(checkListId),
    );
    const payload = { ...task, checkLists: updatedCheckLists };
    await updateTaskApi(payload, user.token, dispatch);
  };

  const handleAddChecklistItem = async (checkListId) => {
    const title = newItem.trim();
    if (!title) return;

    const newCheckItem = {
      checkItemId: '',
      checkItemTitle: title,
      checkItemDescription: title,
      checkItemDueDate: null,
      isChecked: false,
    };

    const updatedCheckLists = (task.checkLists || []).map((cl) => {
      if (String(cl.checkListId) === String(checkListId)) {
        const items = Array.isArray(cl.listItems) ? cl.listItems : [];
        return { ...cl, listItems: [...items, newCheckItem] };
      }
      return cl;
    });

    const payload = { ...task, checkLists: updatedCheckLists };

    console.log(payload);

    await updateTaskApi(payload, user.token, dispatch);
    setNewItem('');
    setActiveId(null);
  };

  // const handleToggleChecklistItem = async (checkListId, checkItemId) => {
  //   console.log({ checkListId, checkItemId });
  // };

  return (
    <div className="checklist__container">
      <div className="checklist_content">
        {(checkList || []).map((list, idx) => {
          const cid = list.checkListId || idx;

          return (
            <div key={cid} className="checklist_item">
              <div className="checklist_item_header">
                <div className="checklist_item_title">
                  <input type="checkbox" checked={!!list.isChecked} readOnly />
                  <span className={list.isChecked ? 'completed' : ''}>{list.checkListName}</span>
                </div>

                <div className="checklist_item_button d-flex gap-2">
                  <button
                    type="button"
                    className="btn_add_check_list_item"
                    onClick={() => toggleAddItemRow(cid)}
                    title="Add"
                  >
                    <FaPlus size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn_add_check_list_item"
                    onClick={() => handleDeleteChecklist(cid)}
                    title="Delete"
                  >
                    <RiDeleteBin5Fill size={14} />
                  </button>
                </div>
              </div>

              {Array.isArray(list.listItems) && list.listItems.length > 0 && (
                <div className="checklist_subitems">
                  {list.listItems.map((it, i) => (
                    <div
                      className="d-flex align-items-center justify-content-between"
                      key={it.checkItemId || i}
                    >
                      <div className="checklist_subitem">
                        <input
                          type="checkbox"
                          checked={!!it.isChecked}
                          // onClick={handleToggleChecklistItem(cid, it.checkItemId)}
                        />
                        <span className={it.isChecked ? 'completed' : ''}>{it.checkItemTitle}</span>
                      </div>
                      <div></div>
                    </div>
                  ))}
                </div>
              )}

              {String(activeId) === String(cid) && (
                <div className="add_checklist_item">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="New checklist item..."
                  />
                  <button
                    type="button"
                    className="btn_add_item"
                    onClick={() => handleAddChecklistItem(cid)}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div className="checklist_footer">
          {!isAddingList ? (
            <button
              type="button"
              className="btn_add_checklist"
              onClick={() => setIsAddingList(true)}
            >
              + Add checklist
            </button>
          ) : (
            <div className="add_checklist_row">
              <input
                type="text"
                value={newCheckListName}
                onChange={(e) => setNewCheckListName(e.target.value)}
                placeholder="Checklist name..."
              />
              <button type="button" onClick={handleAddChecklist}>
                Add
              </button>
              <button
                type="button"
                className="btn_cancel"
                onClick={() => {
                  setIsAddingList(false);
                  setNewCheckListName('');
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
