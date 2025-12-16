import React, { useEffect } from "react";
import "./DetailScore.scss";
import { useAuth } from "../../../context/AuthProvider";
import {
  saveScore,
  updateScoreCategory,
  getScoreCategoriesByClass,
  deleteScoreCategory,
} from "../../../service/ScoreService";
import Swal from "sweetalert2";
import { fetchUserById } from "../../../service/UserService";

const DetailScore = ({
  handleActiveDetail,
  student,
  categories = [],
  loading = false,
  groupId = null,
  onScoreSaved,
}) => {
  const [dataUser, setDataUser] = React.useState(null);
  let currentUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  console.log("debug: ", dataUser);
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleActiveDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleActiveDetail]);

  // defensive: if student is not provided, don't render (parent should provide student)
  if (!student) return null;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserById(currentUser.token, student._id);
        setDataUser({
          name: data?.full_name || data?.name || data?.work_id || "Unknown",
          email: data?.email || "",
          avatar_link:
            data?.avatar_link ||
            "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1",
        });
        console.log("Fetched user data:", data);
      } catch (err) {
        console.error("failed to fetch student user data", err);
      }
    };
    fetchData();
  }, [student]);

  // safe defaults for properties that may be missing depending on how student was created
  const classCodes = Array.isArray(student.classCode) ? student.classCode : [];
  const subjectCodes = Array.isArray(student.subjectCode)
    ? student.subjectCode
    : [];
  const avatarSrc =
    dataUser?.avatar_link ||
    "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1";
  const displayName =
    student.name || student.full_name || student.work_id || "Unknown";
  const displayEmail = student.email || student?.user?.email || "";

  console.log("avatarSrc: ", avatarSrc);
  // Build a set of candidate identifiers for the selected student to match scoreItems robustly
  const studentIdCandidates = React.useMemo(() => {
    if (!student) return new Set();
    const raw = [
      student._id,
      student.user_id,
      student.userId,
      student.id,
      student.work_id,
      student.workId,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim());
    if (student.email) raw.push(String(student.email).toLowerCase().trim());
    return new Set(raw);
  }, [student]);

  const matchScoreItem = React.useCallback(
    (si) => {
      if (!si) return false;
      // check typical id fields and email
      const candidates = [
        si.userId,
        si.user_id,
        si.id,
        si._id,
        si.user?.id,
        si.user?.userId,
        si.userEmail,
        si.email,
      ];
      for (const f of candidates) {
        if (f === null || f === undefined) continue;
        const fs = String(f).toLowerCase().trim();
        if (studentIdCandidates.has(fs)) return true;
      }
      return false;
    },
    [studentIdCandidates]
  );

  const primaryStudentId = React.useMemo(() => {
    return (
      student?.userId ||
      student?._id ||
      student?.user_id ||
      student?.id ||
      student?.work_id ||
      ""
    );
  }, [student]);
  // (moved) compute weighted total and average from categories and student's score items
  const { user } = useAuth();
  const token = user?.token || null;
  const isLecturer = user?.role === "LECTURER";
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editValues, setEditValues] = React.useState({});
  const [savedScores, setSavedScores] = React.useState({});
  // local copy of categories to allow immediate UI updates for visualize toggles
  const [localCats, setLocalCats] = React.useState(
    Array.isArray(categories) ? categories : []
  );
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [editCatFields, setEditCatFields] = React.useState({
    scoreCategoryName: "",
    scoreCategoryWeight: "",
    scoreCategoryComment: "",
  });
  const [savingCategory, setSavingCategory] = React.useState(false);
  // inline double-click edit state
  const [inlineEditingCatId, setInlineEditingCatId] = React.useState(null);
  const [inlineEditFields, setInlineEditFields] = React.useState({
    scoreCategoryName: "",
    scoreCategoryWeight: "",
    scoreCategoryComment: "",
  });
  const [inlineSaving, setInlineSaving] = React.useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = React.useState(null);

  React.useEffect(() => {
    setLocalCats(Array.isArray(categories) ? categories : []);
  }, [categories]);

  // compute weighted total and average from categories and student's score items
  const { totalScore, averageScore, isPassed } = React.useMemo(() => {
    let weightedSum = 0;
    let sumWeights = 0;
    let hasZeroScore = false;
    if (Array.isArray(localCats)) {
      localCats.forEach((c, idx) => {
        const studentItem = Array.isArray(c.scoreItems)
          ? c.scoreItems.find((si) => matchScoreItem(si))
          : null;
        const valRaw = studentItem ? studentItem.scoreItemValue : null;
        const val =
          valRaw !== null &&
          valRaw !== undefined &&
          !Number.isNaN(Number(valRaw))
            ? Number(valRaw)
            : NaN;
        const w =
          typeof c.scoreCategoryWeight === "number" &&
          !Number.isNaN(c.scoreCategoryWeight)
            ? c.scoreCategoryWeight
            : 0;
        if (!Number.isNaN(val) && w > 0) {
          weightedSum += val * w;
          sumWeights += w;
          // Check if any score is 0
          if (val === 0) {
            hasZeroScore = true;
          }
        }
      });
    }
    const avg = sumWeights > 0 ? weightedSum / sumWeights : 0;
    // Student fails if average < 5 OR if any category has 0 score
    return {
      totalScore: Number(weightedSum.toFixed(2)),
      averageScore: Number(avg.toFixed(2)),
      isPassed: avg >= 5 && !hasZeroScore,
    };
  }, [localCats, matchScoreItem]);

  const onStartEdit = (idx, category) => {
    const fallbackIdx = idx;
    const key =
      category.scoreCategoryId || category.id || category._id || fallbackIdx;
    // initialize with existing value if present
    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => matchScoreItem(si))
      : null;
    setEditingIndex(idx);
    setEditValues((ev) => ({ ...ev, [key]: existing?.scoreItemValue ?? "" }));
  };

  const onChangeValue = (categoryId, val) => {
    // Validate score doesn't exceed 10
    if (val !== "" && !isNaN(Number(val)) && Number(val) > 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Score",
        text: "The score must not exceed 10.",
      });
      return;
    }
    setEditValues((ev) => ({ ...ev, [categoryId]: val }));
  };

  const onSaveValue = async (category) => {
    // derive a stable key used in edit map / saved map
    const fallbackIdx = localCats.indexOf(category);
    const key =
      category.scoreCategoryId || category.id || category._id || fallbackIdx;
    const raw = editValues[key];
    const val = parseFloat(raw);
    if (isNaN(val)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Please enter a valid number",
      });
      return;
    }
    if (val > 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Score",
        text: "The score must not exceed 10.",
      });
      return;
    }
    // check if there is an existing scoreItem for this user
    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => matchScoreItem(si))
      : null;
    const payload = {
      scoreItemId: existing?.scoreItemId ?? null,
      scoreItemName: existing?.scoreItemName ?? null,
      scoreItemValue: val,
      userId: primaryStudentId || null,
      groupId: groupId || student.groupId || student.group_id || null,
      scoreCategory: category,
    };
    try {
      const res = await saveScore(payload, token);

      // Update local category with new scoreItem to ensure immediate UI feedback
      setLocalCats((prev) =>
        prev.map((cat) => {
          const catKey =
            cat.scoreCategoryId || cat.id || cat._id || prev.indexOf(cat);
          if (String(catKey) === String(key)) {
            // Find and update or add the scoreItem
            const newItem = {
              ...existing,
              scoreItemValue: res?.scoreItemValue ?? val,
              scoreItemId: res?.scoreItemId ?? existing?.scoreItemId,
              userId: primaryStudentId || null,
            };
            const items = Array.isArray(cat.scoreItems)
              ? [...cat.scoreItems]
              : [];
            const existingIdx = items.findIndex((si) => matchScoreItem(si));
            if (existingIdx >= 0) {
              items[existingIdx] = newItem;
            } else {
              items.push(newItem);
            }
            return { ...cat, scoreItems: items };
          }
          return cat;
        })
      );

      // Clear saved scores since we updated the category directly
      setSavedScores({});
      setEditValues((ev) => ({ ...ev, [key]: res?.scoreItemValue ?? val }));
      setEditingIndex(-1);

      // Notify parent to refresh data
      if (onScoreSaved) {
        onScoreSaved();
      }
    } catch (e) {
      console.error("saveScore failed", e);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Failed to save score",
      });
    }
  };

  // lecturer-only: toggle whether this student's scoreItem is visible for ONE category
  const toggleVisualize = async (category) => {
    if (!isLecturer) return;

    const existing = Array.isArray(category.scoreItems)
      ? category.scoreItems.find((si) => matchScoreItem(si))
      : null;
    const targetVisible = !(existing && existing.isVisualize);

    try {
      if (!existing && !targetVisible) {
        // nothing to do (hiding non-existing item)
        return;
      }

      const payload = {
        scoreItemId: existing?.scoreItemId ?? null,
        scoreItemName: existing?.scoreItemName ?? null,
        scoreItemValue: existing?.scoreItemValue ?? 0,
        isVisualize: targetVisible,
        userId: primaryStudentId || null,
        groupId:
          (existing?.groupId ??
            groupId ??
            student.groupId ??
            student.group_id) ||
          null,
        scoreCategory: category,
      };
      const res = await saveScore(payload, token);

      // Update only this category in localCats
      const updated = localCats.map((cat) => {
        const catId = cat.scoreCategoryId || cat.id || cat._id;
        const targetId =
          category.scoreCategoryId || category.id || category._id;
        if (catId === targetId) {
          if (res) {
            const items = Array.isArray(cat.scoreItems)
              ? (() => {
                  const found = cat.scoreItems.find(
                    (si) =>
                      si.scoreItemId === res.scoreItemId ||
                      si.userId === res.userId
                  );
                  if (found) {
                    return cat.scoreItems.map((si) =>
                      si.scoreItemId === res.scoreItemId ||
                      si.userId === res.userId
                        ? { ...si, ...res }
                        : si
                    );
                  }
                  return [...cat.scoreItems, res];
                })()
              : [res];
            return { ...cat, scoreItems: items };
          }
          // fallback: update existing item's isVisualize
          if (Array.isArray(cat.scoreItems)) {
            const items = cat.scoreItems.map((si) => {
              if (matchScoreItem(si)) {
                return { ...si, isVisualize: targetVisible };
              }
              return si;
            });
            return { ...cat, scoreItems: items };
          }
        }
        return cat;
      });

      setLocalCats(updated);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: targetVisible
          ? "Score is now visible to students"
          : "Score is now hidden from students",
      });
    } catch (e) {
      console.error("toggle visualize failed", e);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update visibility",
      });
    }
  };

  // lecturer-only: toggle visibility for ALL categories at once
  const toggleAllVisualize = async () => {
    if (!isLecturer) return;

    // Determine target: if ANY score is hidden, show all; otherwise hide all
    let anyHidden = false;
    for (const cat of localCats) {
      const existing = Array.isArray(cat.scoreItems)
        ? cat.scoreItems.find((si) => matchScoreItem(si))
        : null;
      if (!existing || !existing.isVisualize) {
        anyHidden = true;
        break;
      }
    }
    const targetVisible = anyHidden;

    try {
      const ops = localCats.map(async (cat) => {
        const existing = Array.isArray(cat.scoreItems)
          ? cat.scoreItems.find((si) => matchScoreItem(si))
          : null;

        if (!existing && !targetVisible) {
          return { catId: cat.scoreCategoryId || cat.id || cat._id, res: null };
        }

        const payload = {
          scoreItemId: existing?.scoreItemId ?? null,
          scoreItemName: existing?.scoreItemName ?? null,
          scoreItemValue: existing?.scoreItemValue ?? 0,
          isVisualize: targetVisible,
          userId: primaryStudentId || null,
          groupId:
            (existing?.groupId ??
              groupId ??
              student.groupId ??
              student.group_id) ||
            null,
          scoreCategory: cat,
        };
        const res = await saveScore(payload, token);
        return { catId: cat.scoreCategoryId || cat.id || cat._id, res };
      });

      const settled = await Promise.allSettled(ops);

      const updated = localCats.map((cat, i) => {
        const outcome = settled[i];
        if (!outcome || outcome.status !== "fulfilled" || !outcome.value) {
          if (Array.isArray(cat.scoreItems)) {
            const items = cat.scoreItems.map((si) => {
              if (matchScoreItem(si)) {
                return { ...si, isVisualize: targetVisible };
              }
              return si;
            });
            return { ...cat, scoreItems: items };
          }
          return cat;
        }

        const { res } = outcome.value;
        if (res) {
          const items = Array.isArray(cat.scoreItems)
            ? (() => {
                const found = cat.scoreItems.find(
                  (si) =>
                    si.scoreItemId === res.scoreItemId ||
                    si.userId === res.userId
                );
                if (found) {
                  return cat.scoreItems.map((si) =>
                    si.scoreItemId === res.scoreItemId ||
                    si.userId === res.userId
                      ? { ...si, ...res }
                      : si
                  );
                }
                return [...cat.scoreItems, res];
              })()
            : [res];
          return { ...cat, scoreItems: items };
        }

        return cat;
      });

      setLocalCats(updated);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: targetVisible
          ? "All scores are now visible to students"
          : "All scores are now hidden from students",
      });
    } catch (e) {
      console.error("toggle all visualize failed", e);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update visibility for all categories",
      });
    }
  };

  return (
    <div
      className="detail__score"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail score for ${displayName}`}
    >
      {editingCategory && (
        <div className="edit-category-overlay" role="dialog" aria-modal="true">
          <div className="edit-category-card">
            <button
              className="modal-close"
              aria-label="Close edit category"
              onClick={() => setEditingCategory(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3>Edit category</h3>
            <div className="field">
              <label>Name</label>
              <input
                value={editCatFields.scoreCategoryName}
                onChange={(e) =>
                  setEditCatFields((s) => ({
                    ...s,
                    scoreCategoryName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>Weight (%)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={editCatFields.scoreCategoryWeight}
                onChange={(e) =>
                  setEditCatFields((s) => ({
                    ...s,
                    scoreCategoryWeight: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>Comment</label>
              <textarea
                value={editCatFields.scoreCategoryComment}
                onChange={(e) =>
                  setEditCatFields((s) => ({
                    ...s,
                    scoreCategoryComment: e.target.value,
                  }))
                }
              />
            </div>
            <div className="actions">
              <button
                className="btn btn--secondary"
                onClick={() => setEditingCategory(null)}
                disabled={savingCategory}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={async () => {
                  if (!editingCategory) return;
                  const id =
                    editingCategory.scoreCategoryId ||
                    editingCategory.id ||
                    editingCategory._id;
                  // validation
                  if (
                    !editCatFields.scoreCategoryName ||
                    editCatFields.scoreCategoryName.trim() === ""
                  ) {
                    Swal.fire({
                      icon: "warning",
                      title: "Required Field",
                      text: "Category name is required",
                    });
                    return;
                  }
                  const weightNum = Number(editCatFields.scoreCategoryWeight);
                  if (
                    Number.isNaN(weightNum) ||
                    weightNum < 0 ||
                    weightNum > 100
                  ) {
                    Swal.fire({
                      icon: "warning",
                      title: "Invalid Weight",
                      text: "Please enter a weight from 0 to 100",
                    });
                    return;
                  }

                  // Check if total weight would exceed 100%
                  const otherCatsWeight = localCats
                    .filter((cat) => {
                      const catId = cat.scoreCategoryId || cat.id || cat._id;
                      return String(catId) !== String(id);
                    })
                    .reduce((sum, cat) => {
                      const w =
                        typeof cat.scoreCategoryWeight === "number"
                          ? cat.scoreCategoryWeight * 100
                          : 0;
                      return sum + w;
                    }, 0);

                  if (otherCatsWeight + weightNum > 100) {
                    Swal.fire({
                      icon: "warning",
                      title: "Weight Limit Exceeded",
                      text: `Total weight cannot exceed 100%. Other categories currently total ${otherCatsWeight.toFixed(
                        2
                      )}%`,
                    });
                    return;
                  }
                  const payload = {
                    scoreCategoryName: editCatFields.scoreCategoryName.trim(),
                    scoreCategoryWeight: weightNum / 100,
                    scoreCategoryComment:
                      editCatFields.scoreCategoryComment || null,
                    // include classId so backend keeps the category associated with its class
                    classId:
                      editingCategory?.classId ||
                      editingCategory?.class ||
                      null,
                    scoreItems: editingCategory?.scoreItems || [],
                  };
                  try {
                    setSavingCategory(true);
                    // Log payload for debugging: inspect what is sent to updateScoreCategory
                    console.log("updateScoreCategory payload (modal save)", {
                      id,
                      payload,
                    });
                    const res = await updateScoreCategory(id, payload, token);
                    console.log(
                      "updateScoreCategory response (modal save)",
                      res
                    );
                    // update localCats with returned data if possible, or apply fields
                    setLocalCats((prev) =>
                      prev.map((cat) => {
                        const key = cat.scoreCategoryId || cat.id || cat._id;
                        const matchKey =
                          editingCategory.scoreCategoryId ||
                          editingCategory.id ||
                          editingCategory._id;
                        if (String(key) === String(matchKey)) {
                          return {
                            ...cat,
                            scoreCategoryName:
                              res?.scoreCategoryName ??
                              payload.scoreCategoryName,
                            scoreCategoryWeight:
                              typeof res?.scoreCategoryWeight === "number"
                                ? res.scoreCategoryWeight
                                : payload.scoreCategoryWeight,
                            scoreCategoryComment:
                              res?.scoreCategoryComment ??
                              payload.scoreCategoryComment,
                          };
                        }
                        return cat;
                      })
                    );
                    // Attempt to re-fetch authoritative categories from server so changes persist across openings.
                    try {
                      // try to determine classId: prefer editingCategory.classId or fallback to first localCats entry
                      const classId =
                        editingCategory?.classId ||
                        editingCategory?.class ||
                        (localCats &&
                          localCats[0] &&
                          (localCats[0].classId || localCats[0].class));
                      if (classId) {
                        const fresh = await getScoreCategoriesByClass(
                          classId,
                          token
                        );
                        if (Array.isArray(fresh)) setLocalCats(fresh);
                      } else {
                        // if no classId available, log response for debugging
                        console.debug("updateScoreCategory response", res);
                      }
                    } catch (e) {
                      console.warn(
                        "Failed to re-fetch categories after update",
                        e
                      );
                    }
                    setEditingCategory(null);
                  } catch (e) {
                    console.error("updateScoreCategory failed", e);
                    Swal.fire({
                      icon: "error",
                      title: "Update Failed",
                      text: "Failed to update category",
                    });
                  } finally {
                    setSavingCategory(false);
                  }
                }}
                disabled={savingCategory}
              >
                {savingCategory ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="detail__score__container">
        <div className="detail__score__container__left">
          <div className="detail__score__container__left__infor">
            <img src={dataUser?.avatar_link} alt={displayName} />
            <h3>{displayName}</h3>
            <p className="email">{displayEmail}</p>
            {classCodes && classCodes.length > 0 && (
              <div className="meta-list">
                <h4>Classes</h4>
                <ul>
                  {classCodes.map((cc, i) => (
                    <li key={`c-${i}`}>{cc}</li>
                  ))}
                </ul>
              </div>
            )}
            {subjectCodes && subjectCodes.length > 0 && (
              <div className="meta-list">
                <h4>Subjects</h4>
                <ul>
                  {subjectCodes.map((s, i) => (
                    <li key={`s-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="detail__score__container__right">
          <div className="detail__score__container__right__heading">
            <h2>Report Score</h2>
            <button
              className="modal-close-top-right"
              aria-label="Close detail popup"
              onClick={handleActiveDetail}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
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
            {isLecturer && (
              <div className="detail__score__container__right__total__status__toggle">
                <button
                  className="btn btn--toggle-all"
                  onClick={toggleAllVisualize}
                  title="Toggle visibility for all scores"
                >
                  <i className="fa-solid fa-eye"></i> Turn on/off show all
                  scores
                </button>
              </div>
            )}
          </div>
          <div className="detail__score__container__right__table__list">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Item (optional)</th>
                  <th>Weight (%)</th>
                  <th>Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>Loading categories...</td>
                  </tr>
                ) : localCats && localCats.length > 0 ? (
                  localCats.map((c, idx) => (
                    <tr key={c.scoreCategoryId || c.id || c._id}>
                      <td
                        style={{
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "100%",
                        }}
                      >
                        {(() => {
                          const key = c.scoreCategoryId || c.id || c._id || idx;
                          const isInline = inlineEditingCatId === String(key);
                          if (isInline) {
                            return (
                              <input
                                id={`inline-name-${String(key)}`}
                                className="inline-cat-name"
                                value={inlineEditFields.scoreCategoryName}
                                onChange={(e) =>
                                  setInlineEditFields((s) => ({
                                    ...s,
                                    scoreCategoryName: e.target.value,
                                  }))
                                }
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    // save (same behavior as blur save)
                                    if (inlineSaving) return;
                                    setInlineSaving(true);
                                    try {
                                      const id =
                                        c.scoreCategoryId || c.id || c._id;
                                      const name = (
                                        inlineEditFields.scoreCategoryName || ""
                                      ).trim();
                                      const weightNum = Number(
                                        inlineEditFields.scoreCategoryWeight
                                      );

                                      // Validate weight
                                      if (
                                        !Number.isNaN(weightNum) &&
                                        (weightNum < 0 || weightNum > 100)
                                      ) {
                                        Swal.fire({
                                          icon: "warning",
                                          title: "Invalid Weight",
                                          text: "Weight must be from 0 to 100%",
                                        });
                                        setInlineSaving(false);
                                        return;
                                      }

                                      // Check total weight doesn't exceed 100%
                                      const otherCatsWeight = localCats
                                        .filter((cat) => {
                                          const catId =
                                            cat.scoreCategoryId ||
                                            cat.id ||
                                            cat._id;
                                          return String(catId) !== String(id);
                                        })
                                        .reduce((sum, cat) => {
                                          const w =
                                            typeof cat.scoreCategoryWeight ===
                                            "number"
                                              ? cat.scoreCategoryWeight * 100
                                              : 0;
                                          return sum + w;
                                        }, 0);

                                      if (
                                        !Number.isNaN(weightNum) &&
                                        otherCatsWeight + weightNum > 100
                                      ) {
                                        Swal.fire({
                                          icon: "warning",
                                          title: "Weight Limit Exceeded",
                                          text: `Total weight cannot exceed 100%. Other categories total ${otherCatsWeight.toFixed(
                                            2
                                          )}%`,
                                        });
                                        setInlineSaving(false);
                                        return;
                                      }

                                      const payload = {
                                        scoreCategoryName: name,
                                        scoreCategoryWeight: Number.isNaN(
                                          weightNum
                                        )
                                          ? c.scoreCategoryWeight ?? 0
                                          : weightNum / 100,
                                        scoreCategoryComment:
                                          inlineEditFields.scoreCategoryComment ||
                                          c.scoreCategoryComment ||
                                          null,
                                        // include classId to preserve association on server
                                        classId: c.classId || c.class || null,
                                        scoreItems: c.scoreItems || [],
                                      };
                                      console.log(
                                        "updateScoreCategory payload (inline Enter)",
                                        { id, payload }
                                      );
                                      const res = await updateScoreCategory(
                                        id,
                                        payload,
                                        token
                                      );
                                      console.log(
                                        "updateScoreCategory response (inline Enter)",
                                        res
                                      );
                                      setLocalCats((prev) =>
                                        prev.map((cat) => {
                                          const k =
                                            cat.scoreCategoryId ||
                                            cat.id ||
                                            cat._id;
                                          if (String(k) === String(id)) {
                                            return {
                                              ...cat,
                                              scoreCategoryName:
                                                res?.scoreCategoryName ??
                                                payload.scoreCategoryName,
                                              scoreCategoryWeight:
                                                typeof res?.scoreCategoryWeight ===
                                                "number"
                                                  ? res.scoreCategoryWeight
                                                  : payload.scoreCategoryWeight,
                                              scoreCategoryComment:
                                                res?.scoreCategoryComment ??
                                                payload.scoreCategoryComment,
                                            };
                                          }
                                          return cat;
                                        })
                                      );
                                    } catch (err) {
                                      console.error(
                                        "inline update failed",
                                        err
                                      );
                                    } finally {
                                      setInlineSaving(false);
                                      setInlineEditingCatId(null);
                                    }
                                  } else if (e.key === "Escape") {
                                    setInlineEditingCatId(null);
                                  }
                                }}
                                onBlur={async (e) => {
                                  // if focus moved to the weight input (or stayed on name), don't save here
                                  const related =
                                    (e &&
                                      (e.relatedTarget ||
                                        (e.nativeEvent &&
                                          e.nativeEvent.relatedTarget))) ||
                                    document.activeElement;
                                  const relatedId = related && related.id;
                                  const myKey = String(
                                    c.scoreCategoryId || c.id || c._id || idx
                                  );
                                  if (
                                    relatedId === `inline-weight-${myKey}` ||
                                    relatedId === `inline-name-${myKey}`
                                  ) {
                                    // focus moved inside the inline editor, let the other input handle save
                                    return;
                                  }
                                  // otherwise perform save on blur
                                  if (inlineSaving) return;
                                  setInlineSaving(true);
                                  try {
                                    const id =
                                      c.scoreCategoryId || c.id || c._id;
                                    const name = (
                                      inlineEditFields.scoreCategoryName || ""
                                    ).trim();
                                    const weightNum = Number(
                                      inlineEditFields.scoreCategoryWeight
                                    );

                                    // Validate weight
                                    if (
                                      !Number.isNaN(weightNum) &&
                                      (weightNum < 0 || weightNum > 100)
                                    ) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: "Invalid Weight",
                                        text: "Weight must be from 0 to 100%",
                                      });
                                      setInlineSaving(false);
                                      setInlineEditingCatId(null);
                                      return;
                                    }

                                    // Check total weight doesn't exceed 100%
                                    const otherCatsWeight = localCats
                                      .filter((cat) => {
                                        const catId =
                                          cat.scoreCategoryId ||
                                          cat.id ||
                                          cat._id;
                                        return String(catId) !== String(id);
                                      })
                                      .reduce((sum, cat) => {
                                        const w =
                                          typeof cat.scoreCategoryWeight ===
                                          "number"
                                            ? cat.scoreCategoryWeight * 100
                                            : 0;
                                        return sum + w;
                                      }, 0);

                                    if (
                                      !Number.isNaN(weightNum) &&
                                      otherCatsWeight + weightNum > 100
                                    ) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: "Weight Limit Exceeded",
                                        text: `Total weight cannot exceed 100%. Other categories total ${otherCatsWeight.toFixed(
                                          2
                                        )}%`,
                                      });
                                      setInlineSaving(false);
                                      setInlineEditingCatId(null);
                                      return;
                                    }

                                    const payload = {
                                      scoreCategoryName: name,
                                      scoreCategoryWeight: Number.isNaN(
                                        weightNum
                                      )
                                        ? c.scoreCategoryWeight ?? 0
                                        : weightNum / 100,
                                      scoreCategoryComment:
                                        inlineEditFields.scoreCategoryComment ||
                                        c.scoreCategoryComment ||
                                        null,
                                      // include classId to preserve association on server
                                      classId: c.classId || c.class || null,
                                      scoreItems: c.scoreItems || [],
                                    };
                                    console.log(
                                      "updateScoreCategory payload (inline blur)",
                                      { id, payload }
                                    );
                                    const res = await updateScoreCategory(
                                      id,
                                      payload,
                                      token
                                    );
                                    console.log(
                                      "updateScoreCategory response (inline blur)",
                                      res
                                    );
                                    setLocalCats((prev) =>
                                      prev.map((cat) => {
                                        const k =
                                          cat.scoreCategoryId ||
                                          cat.id ||
                                          cat._id;
                                        if (String(k) === String(id)) {
                                          return {
                                            ...cat,
                                            scoreCategoryName:
                                              res?.scoreCategoryName ??
                                              payload.scoreCategoryName,
                                            scoreCategoryWeight:
                                              typeof res?.scoreCategoryWeight ===
                                              "number"
                                                ? res.scoreCategoryWeight
                                                : payload.scoreCategoryWeight,
                                            scoreCategoryComment:
                                              res?.scoreCategoryComment ??
                                              payload.scoreCategoryComment,
                                          };
                                        }
                                        return cat;
                                      })
                                    );
                                  } catch (err) {
                                    console.error(
                                      "inline update onBlur failed",
                                      err
                                    );
                                  } finally {
                                    setInlineSaving(false);
                                    setInlineEditingCatId(null);
                                  }
                                }}
                              />
                            );
                          }
                          return (
                            <span
                              onClick={() => {
                                const name = c.scoreCategoryName || "";
                                const weight =
                                  typeof c.scoreCategoryWeight === "number"
                                    ? c.scoreCategoryWeight * 100
                                    : "";
                                const comment = c.scoreCategoryComment || "";
                                const keyId =
                                  c.scoreCategoryId || c.id || c._id || idx;
                                setInlineEditFields({
                                  scoreCategoryName: name,
                                  scoreCategoryWeight: weight,
                                  scoreCategoryComment: comment,
                                });
                                setInlineEditingCatId(String(keyId));
                                // focus the generated input after it appears
                                setTimeout(() => {
                                  const el = document.getElementById(
                                    `inline-name-${String(keyId)}`
                                  );
                                  if (el) el.focus();
                                }, 50);
                              }}
                            >
                              {c.scoreCategoryName}
                            </span>
                          );
                        })()}
                        {/* inline click to edit — pen icon removed */}
                      </td>
                      <td>
                        {(() => {
                          const key = c.scoreCategoryId || c.id || c._id || idx;
                          const isInline = inlineEditingCatId === String(key);
                          if (isInline) {
                            return (
                              <input
                                id={`inline-weight-${String(key)}`}
                                className="inline-cat-weight"
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                value={inlineEditFields.scoreCategoryWeight}
                                onChange={(e) =>
                                  setInlineEditFields((s) => ({
                                    ...s,
                                    scoreCategoryWeight: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    // blur to trigger save via onBlur
                                    e.currentTarget.blur();
                                  } else if (e.key === "Escape") {
                                    // cancel inline edit
                                    setInlineEditingCatId(null);
                                  }
                                }}
                                onBlur={async (e) => {
                                  // if focus moved to the name input of same key, don't save here
                                  const related =
                                    (e &&
                                      (e.relatedTarget ||
                                        (e.nativeEvent &&
                                          e.nativeEvent.relatedTarget))) ||
                                    document.activeElement;
                                  const relatedId = related && related.id;
                                  const myKey = String(key);
                                  if (
                                    relatedId === `inline-name-${myKey}` ||
                                    relatedId === `inline-weight-${myKey}`
                                  ) {
                                    // focus stayed within inline editor
                                    return;
                                  }
                                  if (inlineSaving) return;
                                  setInlineSaving(true);
                                  try {
                                    const id =
                                      c.scoreCategoryId || c.id || c._id;
                                    const name = (
                                      inlineEditFields.scoreCategoryName || ""
                                    ).trim();
                                    const weightNum = Number(
                                      inlineEditFields.scoreCategoryWeight
                                    );

                                    // Validate weight
                                    if (
                                      !Number.isNaN(weightNum) &&
                                      (weightNum < 0 || weightNum > 100)
                                    ) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: "Invalid Weight",
                                        text: "Weight must be from 0 to 100%",
                                      });
                                      setInlineSaving(false);
                                      setInlineEditingCatId(null);
                                      return;
                                    }

                                    // Check total weight doesn't exceed 100%
                                    const otherCatsWeight = localCats
                                      .filter((cat) => {
                                        const catId =
                                          cat.scoreCategoryId ||
                                          cat.id ||
                                          cat._id;
                                        return String(catId) !== String(id);
                                      })
                                      .reduce((sum, cat) => {
                                        const w =
                                          typeof cat.scoreCategoryWeight ===
                                          "number"
                                            ? cat.scoreCategoryWeight * 100
                                            : 0;
                                        return sum + w;
                                      }, 0);

                                    if (
                                      !Number.isNaN(weightNum) &&
                                      otherCatsWeight + weightNum > 100
                                    ) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: "Weight Limit Exceeded",
                                        text: `Total weight cannot exceed 100%. Other categories total ${otherCatsWeight.toFixed(
                                          2
                                        )}%`,
                                      });
                                      setInlineSaving(false);
                                      setInlineEditingCatId(null);
                                      return;
                                    }

                                    const payload = {
                                      scoreCategoryName: name,
                                      scoreCategoryWeight: Number.isNaN(
                                        weightNum
                                      )
                                        ? c.scoreCategoryWeight ?? 0
                                        : weightNum / 100,
                                      scoreCategoryComment:
                                        inlineEditFields.scoreCategoryComment ||
                                        c.scoreCategoryComment ||
                                        null,
                                      classId: c.classId || c.class || null,
                                      scoreItems: c.scoreItems || [],
                                    };
                                    console.log(
                                      "updateScoreCategory payload (inline weight blur)",
                                      { id, payload }
                                    );
                                    const res = await updateScoreCategory(
                                      id,
                                      payload,
                                      token
                                    );
                                    console.log(
                                      "updateScoreCategory response (inline weight blur)",
                                      res
                                    );
                                    setLocalCats((prev) =>
                                      prev.map((cat) => {
                                        const k =
                                          cat.scoreCategoryId ||
                                          cat.id ||
                                          cat._id;
                                        if (String(k) === String(id)) {
                                          return {
                                            ...cat,
                                            scoreCategoryName:
                                              res?.scoreCategoryName ??
                                              payload.scoreCategoryName,
                                            scoreCategoryWeight:
                                              typeof res?.scoreCategoryWeight ===
                                              "number"
                                                ? res.scoreCategoryWeight
                                                : payload.scoreCategoryWeight,
                                            scoreCategoryComment:
                                              res?.scoreCategoryComment ??
                                              payload.scoreCategoryComment,
                                          };
                                        }
                                        return cat;
                                      })
                                    );
                                  } catch (err) {
                                    console.error(
                                      "inline weight update onBlur failed",
                                      err
                                    );
                                  } finally {
                                    setInlineSaving(false);
                                    setInlineEditingCatId(null);
                                  }
                                }}
                              />
                            );
                          }
                          return typeof c.scoreCategoryWeight === "number"
                            ? c.scoreCategoryWeight * 100
                            : "";
                        })()}
                      </td>
                      {
                        // find this student's score item in the category
                      }
                      {(() => {
                        const key = c.scoreCategoryId || c.id || c._id || idx;
                        const studentItem = Array.isArray(c.scoreItems)
                          ? c.scoreItems.find((si) => matchScoreItem(si))
                          : null;
                        const visible = studentItem
                          ? !!studentItem.isVisualize
                          : false;
                        const displayValue =
                          savedScores[key] !== undefined
                            ? savedScores[key]
                            : studentItem
                            ? studentItem.scoreItemValue
                            : null;
                        return (
                          <>
                            <td>
                              {editingIndex === idx ? (
                                <input
                                  autoFocus
                                  className="score__input"
                                  type="number"
                                  step="0.01"
                                  value={editValues[key] ?? ""}
                                  onChange={(e) =>
                                    onChangeValue(key, e.target.value)
                                  }
                                  placeholder="Value"
                                  onBlur={async () => {
                                    // save on blur
                                    try {
                                      await onSaveValue(c);
                                    } catch (e) {
                                      // errors handled in onSaveValue
                                    }
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      try {
                                        await onSaveValue(c);
                                      } catch (err) {}
                                    } else if (e.key === "Escape") {
                                      // cancel edit
                                      setEditingIndex(-1);
                                    }
                                  }}
                                />
                              ) : // clickable value for lecturers; others see value or hidden
                              isLecturer ? (
                                <span
                                  style={{ cursor: "pointer" }}
                                  onClick={() => onStartEdit(idx, c)}
                                >
                                  {!isLecturer && studentItem && !visible
                                    ? "Hidden"
                                    : displayValue !== null &&
                                      displayValue !== undefined
                                    ? displayValue
                                    : "No points yet"}
                                </span>
                              ) : !isLecturer && studentItem && !visible ? (
                                "Hidden"
                              ) : displayValue !== null &&
                                displayValue !== undefined ? (
                                displayValue
                              ) : (
                                "No points yet"
                              )}
                            </td>
                            <td>
                              {isLecturer ? (
                                // show only the visibility (eye) control when not editing; while editing the eye remains available
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    className={`btn btn--eye ${
                                      studentItem && studentItem.isVisualize
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={() => toggleVisualize(c)}
                                    title="Toggle visibility"
                                  >
                                    {studentItem && studentItem.isVisualize ? (
                                      <i className="fa-solid fa-eye"></i>
                                    ) : (
                                      <i className="fa-solid fa-eye-slash"></i>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <i className="fa-solid fa-info"></i>
                              )}
                            </td>
                            <td>
                              {/* Lecturer-only: delete the category */}
                              {isLecturer && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <button
                                    className={`btn btn--danger ${
                                      deletingCategoryId ===
                                      (c.scoreCategoryId || c.id || c._id)
                                        ? "is-loading"
                                        : ""
                                    }`}
                                    disabled={
                                      deletingCategoryId ===
                                      (c.scoreCategoryId || c.id || c._id)
                                    }
                                    onClick={async () => {
                                      const id =
                                        c.scoreCategoryId || c.id || c._id;
                                      const result = await Swal.fire({
                                        icon: "question",
                                        title: "Delete Category",
                                        text: "Delete this score category? This will remove it for all students.",
                                        showCancelButton: true,
                                        confirmButtonText: "Delete",
                                        cancelButtonText: "Cancel",
                                      });
                                      if (!result.isConfirmed) return;
                                      try {
                                        setDeletingCategoryId(id);
                                        console.log(
                                          "deleteScoreCategory request",
                                          { id }
                                        );
                                        const res = await deleteScoreCategory(
                                          id,
                                          token
                                        );
                                        console.log(
                                          "deleteScoreCategory response",
                                          res
                                        );
                                        // remove from localCats for immediate feedback
                                        setLocalCats((prev) =>
                                          prev.filter(
                                            (cat) =>
                                              String(
                                                cat.scoreCategoryId ||
                                                  cat.id ||
                                                  cat._id
                                              ) !== String(id)
                                          )
                                        );
                                      } catch (err) {
                                        console.error(
                                          "deleteScoreCategory failed",
                                          err
                                        );
                                        Swal.fire({
                                          icon: "error",
                                          title: "Delete Failed",
                                          text: "Failed to delete category",
                                        });
                                      } finally {
                                        setDeletingCategoryId(null);
                                      }
                                    }}
                                  >
                                    {deletingCategoryId ===
                                    (c.scoreCategoryId || c.id || c._id) ? (
                                      <i className="fa-solid fa-trash"></i>
                                    ) : (
                                      <i className="fa-solid fa-trash"></i>
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No categories.</td>
                  </tr>
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
