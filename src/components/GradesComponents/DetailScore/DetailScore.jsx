import React from "react";
import "./DetailScore.scss";
import { useAuth } from "../../../context/AuthProvider";
import { saveScore } from "../../../service/ScoreService";

const DetailScore = ({ handleActiveDetail, student, categories = [], loading = false, groupId = null }) => {
  // student and categories are passed from parent. categories are expected to be an array of objects

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleActiveDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleActiveDetail]);

  // defensive: if student is not provided, don't render (parent should provide student)
  if (!student) return null;

  // safe defaults for properties that may be missing depending on how student was created
  const classCodes = Array.isArray(student.classCode) ? student.classCode : [];
  const subjectCodes = Array.isArray(student.subjectCode) ? student.subjectCode : [];
  const avatarSrc = student.avatar || student.avatar_link || '/public/default-avatar.png';
  const displayName = student.name || student.full_name || student.work_id || 'Unknown';
  const displayEmail = student.email || student?.user?.email || '';
  // (moved) compute weighted total and average from categories and student's score items
  const { user } = useAuth();
  const token = user?.token || null;
  const isLecturer = user?.role === 'LECTURER';
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editValues, setEditValues] = React.useState({});
  const [savedScores, setSavedScores] = React.useState({});
  // local copy of categories to allow immediate UI updates for visualize toggles
  const [localCats, setLocalCats] = React.useState(Array.isArray(categories) ? categories : []);

  React.useEffect(() => {
    setLocalCats(Array.isArray(categories) ? categories : []);
  }, [categories]);

  // compute weighted total and average from categories and student's score items
  const { totalScore, averageScore, isPassed } = React.useMemo(() => {
    let weightedSum = 0;
    let sumWeights = 0;
    if (Array.isArray(localCats)) {
      localCats.forEach((c, idx) => {
        const key = c.scoreCategoryId || c.id || c._id || idx;
        const studentItem = Array.isArray(c.scoreItems)
          ? c.scoreItems.find((si) => si.userId === (student._id || student.user_id || student.userId))
          : null;
        const valRaw = (typeof savedScores[key] !== 'undefined') ? savedScores[key] : (studentItem ? studentItem.scoreItemValue : null);
        const val = valRaw !== null && valRaw !== undefined && !Number.isNaN(Number(valRaw)) ? Number(valRaw) : NaN;
        const w = (typeof c.scoreCategoryWeight === 'number' && !Number.isNaN(c.scoreCategoryWeight)) ? c.scoreCategoryWeight : 0;
        if (!Number.isNaN(val) && w > 0) {
          weightedSum += val * w;
          sumWeights += w;
        }
      });
    }
    const avg = sumWeights > 0 ? (weightedSum / sumWeights) : 0;
    return {
      totalScore: Number((weightedSum).toFixed(2)),
      averageScore: Number((avg).toFixed(2)),
      isPassed: avg >= 5,
    };
  }, [localCats, savedScores, student]);

  const onStartEdit = (idx, category) => {
    const key = category.scoreCategoryId || idx;
    // initialize with existing value if present
    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => si.userId === (student._id || student.user_id || student.userId))
      : null;
    setEditingIndex(idx);
    setEditValues((ev) => ({ ...ev, [key]: existing?.scoreItemValue ?? '' }));
  };

  const onChangeValue = (categoryId, val) => {
    setEditValues((ev) => ({ ...ev, [categoryId]: val }));
  };

  const onSaveValue = async (category) => {
    const key = category.scoreCategoryId;
    const raw = editValues[key];
    const val = parseFloat(raw);
    if (isNaN(val)) {
      alert('Enter a valid number');
      return;
    }
    // check if there is an existing scoreItem for this user
    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => si.userId === (student._id || student.user_id || student.userId))
      : null;
    const payload = {
      scoreItemId: existing?.scoreItemId ?? null,
      scoreItemName: existing?.scoreItemName ?? null,
      scoreItemValue: val,
      userId: student._id || student.user_id || student.userId,
      groupId: groupId || student.groupId || student.group_id || null,
      scoreCategory: category,
    };
    try {
      const res = await saveScore(payload, token);
      // reflect returned value in local saved map
      setSavedScores((s) => ({ ...s, [key]: res?.scoreItemValue ?? val }));
      setEditValues((ev) => ({ ...ev, [key]: res?.scoreItemValue ?? val }));
      setEditingIndex(-1);
      alert('Saved');
    } catch (e) {
      console.error('saveScore failed', e);
      alert('Failed to save score');
    }
  };

  // lecturer-only: toggle whether this student's scoreItem is visible to students
  const toggleVisualize = async (category) => {
    if (!isLecturer) return;
    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => si.userId === (student._id || student.user_id || student.userId))
      : null;
    // If no existing scoreItem, create one with isVisualize = true (lecturer can create & grant visibility)
    if (!existing) {
      const payloadCreate = {
        scoreItemId: null,
        scoreItemName: null,
        scoreItemValue: 0,
        isVisualize: true,
        userId: student._id || student.user_id || student.userId,
        groupId: groupId || student.groupId || student.group_id || null,
        scoreCategory: category,
      };
      try {
        const res = await saveScore(payloadCreate, token);
        // Insert returned score item into localCats for this category
        setLocalCats((prev) => prev.map((cat) => {
          if ((cat.scoreCategoryId || cat.id || cat._id) === (category.scoreCategoryId || category.id || category._id)) {
            const items = Array.isArray(cat.scoreItems) ? [...cat.scoreItems, res] : [res];
            return { ...cat, scoreItems: items };
          }
          return cat;
        }));
        alert('Visibility granted and score item created');
      } catch (e) {
        console.error('create+visualize failed', e);
        alert('Failed to create score item and grant visibility');
      }
      return;
    }

    const newVisual = !existing.isVisualize;
    const payload = {
      scoreItemId: existing.scoreItemId,
      scoreItemName: existing.scoreItemName ?? null,
      scoreItemValue: existing.scoreItemValue ?? 0,
      isVisualize: newVisual,
      userId: existing.userId,
      groupId: (existing.groupId ?? groupId ?? student.groupId ?? student.group_id) || null,
      scoreCategory: category,
    };
    try {
      const res = await saveScore(payload, token);
      // update localCats to reflect new isVisualize
      setLocalCats((prev) => prev.map((cat) => {
        if ((cat.scoreCategoryId || cat.id || cat._id) === (category.scoreCategoryId || category.id || category._id)) {
          const items = Array.isArray(cat.scoreItems) ? cat.scoreItems.map((si) => {
            if (si.scoreItemId === existing.scoreItemId || si.userId === existing.userId) {
              return { ...si, isVisualize: res?.isVisualize ?? newVisual };
            }
            return si;
          }) : cat.scoreItems;
          return { ...cat, scoreItems: items };
        }
        return cat;
      }));
      alert('Visibility updated');
    } catch (e) {
      console.error('toggle visualize failed', e);
      alert('Failed to update visibility');
    }
  };

  return (
    <div className="detail__score">
      <div className="detail__score__container">
        <div className="detail__score__container__left">
          <div className="detail__score__container__left__infor">
            <img src={avatarSrc} alt={displayName} />
            <h3>{displayName}</h3>
            <p>{displayEmail}</p>
          </div>
        </div>
        <div className="detail__score__container__right">
          <div className="detail__score__container__right__heading">
            <h2>Report Score</h2>
            <i className="fa-solid fa-xmark" onClick={handleActiveDetail}></i>
          </div>
          <div className="detail__score__container__right__total__status">
            <div className="detail__score__container__right__total__status__total">
              <h4>Average</h4>
              <span className={isPassed ? "isPassed" : "notPassed"}>
                {totalScore}
              </span>
            </div>
            <div className="detail__score__container__right__total__status__status">
              <h4>Status</h4>
              <span className={isPassed ? "isPassed" : "notPassed"}>
                {isPassed ? "Passed" : "Not passed"}
              </span>
            </div>
          </div>
          <div className="detail__score__container__right__table__list">
            <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Item (optional)</th>
                    <th>Weight (%)</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3}>Loading categories...</td></tr>
                  ) : localCats && localCats.length > 0 ? (
                    localCats.map((c, idx) => (
                      <tr key={c.scoreCategoryId || c.id || c._id}>
                        <td style={{ textAlign: 'left' }}>{c.scoreCategoryName}</td>
                        <td>{typeof c.scoreCategoryWeight === 'number' ? (c.scoreCategoryWeight * 100) : ''}</td>
                        {
                          // find this student's score item in the category
                        }
                        {(() => {
                          const key = c.scoreCategoryId || c.id || c._id || idx;
                          const studentItem = Array.isArray(c.scoreItems)
                            ? c.scoreItems.find((si) => si.userId === (student._id || student.user_id || student.userId))
                            : null;
                          const visible = studentItem ? !!studentItem.isVisualize : false;
                          const displayValue = (savedScores[key] !== undefined)
                            ? savedScores[key]
                            : (studentItem ? studentItem.scoreItemValue : null);
                          return (
                            <>
                              <td>
                                {editingIndex === idx ? (
                                  <input
                                    className="score__input"
                                    type="number"
                                    step="0.01"
                                    value={editValues[key] ?? ''}
                                    onChange={(e) => onChangeValue(key, e.target.value)}
                                    placeholder="Value"
                                  />
                                ) : (
                                  // if current user is not lecturer and value exists but not visible, hide it
                                  (!isLecturer && studentItem && !visible) ? 'Hidden' : ((displayValue !== null && displayValue !== undefined) ? displayValue : 'No points yet')
                                )}
                              </td>
                              <td>
                                {isLecturer ? (
                                  editingIndex === idx ? (
                                    <div className="score__actions">
                                      <button className="btn btn--save" onClick={() => onSaveValue(c)}>Save</button>
                                      <button className="btn btn--cancel" onClick={() => setEditingIndex(-1)}>Cancel</button>
                                      <button className={`btn btn--eye ${studentItem && studentItem.isVisualize ? 'active' : ''}`} onClick={() => toggleVisualize(c)} title="Toggle visibility">
                                        {studentItem && studentItem.isVisualize ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <button className="btn btn--edit" onClick={() => onStartEdit(idx, c)}>Edit</button>
                                      {/* show eye button next to Edit for quick access */}
                                      <button className={`btn btn--eye ${studentItem && studentItem.isVisualize ? 'active' : ''}`} onClick={() => toggleVisualize(c)} title="Toggle visibility">
                                        {studentItem && studentItem.isVisualize ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <i className="fa-solid fa-info"></i>
                                )}
                              </td>
                            </>
                          );
                        })()}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3}>No categories.</td></tr>
                  )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailScore;
