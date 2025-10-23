import React, { useEffect, useState } from "react";
import "./AddCategoryByReuse.scss";
import {
  getListScoreCategoryReuse,
  saveScoreCategory,
} from "../../../service/ScoreService";

const AddCategoryByReuse = ({ classId, token, dispatch, onClose }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!classId || !token) return;
      setLoading(true);
      try {
        // Fetch reusable categories for the provided classId
        const res = await getListScoreCategoryReuse(token, dispatch);
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setList(items || []);
      } catch (e) {
        console.error("Failed to load reuse categories", e);
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId, token, dispatch]);

  const toggle = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const handleAdd = async () => {
    if (!selected || selected.length === 0)
      return alert("Please choose at least one category to add.");
    if (!classId) return alert("Please select a class first.");
    setSaving(true);
    try {
      for (const id of selected) {
        const item = list.find(
          (x) =>
            (x.scoreCategoryId || x._id || x.id) === id ||
            x._id === id ||
            x.id === id
        );
        if (!item) continue;
        const payload = {
          scoreCategoryId: null,
          scoreCategoryName:
            item.scoreCategoryName ||
            item.name ||
            item.title ||
            "Reused category",
          scoreCategoryWeight:
            typeof item.scoreCategoryWeight === "number"
              ? item.scoreCategoryWeight
              : item.weight || 0,
          scoreCategoryComment:
            item.scoreCategoryComment || item.comment || null,
          classId,
          scoreItems: item.scoreItems || item.items || [],
        };
        await saveScoreCategory(payload, token, dispatch);
      }
      alert("Selected categories added successfully");
      onClose && onClose();
    } catch (e) {
      console.error("Failed to add reused categories", e);
      alert("Failed to add categories: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="reuse-modal">
      <div className="reuse-modal-card">
        <div className="reuse-modal-header">
          <h3>Reuse categories</h3>
          <button className="close" onClick={() => onClose && onClose()}>
            &times;
          </button>
        </div>
        <div className="reuse-modal-body">
          {loading ? (
            <div>Loading...</div>
          ) : list && list.length > 0 ? (
            <div className="reuse-list">
              {list.map((r) => {
                const id = r.scoreCategoryId || r._id || r.id;
                return (
                  <label key={id} className="reuse-row">
                    <input
                      type="checkbox"
                      checked={selected.includes(id)}
                      onChange={() => toggle(id)}
                    />
                    <div className="reuse-info">
                      <div className="reuse-name">
                        {r.scoreCategoryName || r.name || r.title}
                      </div>
                      <div className="reuse-meta">
                        Weight:{" "}
                        {(
                          (r.scoreCategoryWeight || r.weight || 0) * 100
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div>No reusable categories found.</div>
          )}
        </div>
        <div className="reuse-modal-actions">
          <button onClick={() => onClose && onClose()} disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={saving || selected.length === 0}
          >
            {saving ? "Adding..." : `Add selected (${selected.length})`}
          </button>
        </div>
      </div>
      <div
        className="reuse-modal-backdrop"
        onClick={() => onClose && onClose()}
      />
    </div>
  );
};

export default AddCategoryByReuse;
