import React, { useEffect } from "react";
import "./GradesComponents.scss";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthProvider";
import { getClasses } from "../../service/ClassService";
import decodeToken from "../../service/DecodeJwt";
import { fetchUserById } from "../../service/UserService";
import {
  saveScoreCategory,
  getScoreCategoriesByClass,
} from "../../service/ScoreService";
import AddCategoryByReuse from "./AddCategoryByReuse/AddCategoryByReuse";
import { canViewGroup } from "../../helper/validateStudentGroup";

const GradesComponents = ({ handleActiveDetail, handleActivityAddCore }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const token = user?.token || null;
  const currentSemesterId = useSelector(
    (state) => state.semester?.currentSemesterId
  );
  const uid = String(
    user?.userId ??
      user?.user_id ??
      user?.work_id ??
      user?.workId ??
      user?._id ??
      user?.id ??
      user?.sub ??
      ""
  );
  const tokenPayload = decodeToken(token);
  const tokenId = String(
    tokenPayload?.id ??
      tokenPayload?._id ??
      tokenPayload?.userId ??
      tokenPayload?.sub ??
      ""
  );
  const role = String(user?.role || "").toLowerCase();
  const isStudent = role === "student";

  const [classes, setClasses] = React.useState([]);
  const [area, setArea] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [selectedGroupId, setSelectedGroupId] = React.useState("");

  const [students, setStudents] = React.useState([]);
  const [studentsLoading, setStudentsLoading] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isReuseOpen, setIsReuseOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({
    scoreCategoryName: "",
    scoreCategoryWeight: 0,
    scoreCategoryComment: "",
  });
  const [savingCategory, setSavingCategory] = React.useState(false);

  // pagination for student-class list (when role === STUDENT)
  const [studentPage, setStudentPage] = React.useState(1);
  const classesPerPage = 6; // adjust as desired

  const itemsPerPage = 5;
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = students.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // helper to fetch user profiles for a list of groupStudents
  const fetchProfilesForGroupStudents = async (groupStudents) => {
    if (!groupStudents || groupStudents.length === 0) {
      setStudents([]);
      return;
    }

    if (!token) {
      console.warn("No token available to fetch user profiles");
      const mapped = groupStudents.map((gs, idx) => ({
        _id: gs.groupStudentId || gs.userId || idx,
        name: gs.userId || "Unknown",
        email: "",
        id: gs.userId || "",
        status: true,
        average: 0,
        avatar: "",
      }));
      setStudents(mapped);
      return;
    }

    setStudentsLoading(true);
    try {
      const promises = groupStudents.map((gs) => {
        const uid = gs.userId || gs.groupStudentId;
        return fetchUserById(token, uid).catch((err) => {
          console.warn("Failed to fetch user", uid, err?.message || err);
          return null;
        });
      });

      const results = await Promise.all(promises);

      let mapped = results.filter(Boolean).map((user) => ({
        _id: user._id || user.user_id || user.id,
        name: user.full_name || user.work_id || user.user_id || "Unknown",
        email: user.email || "",
        id: user.work_id || user.user_id || "",
        // status/average will be computed below from score categories when available
        status: typeof user.isActive === "boolean" ? user.isActive : true,
        average:
          typeof user.personal_score === "number" ? user.personal_score : 0,
        avatar: user.avatar_link
          ? user.avatar_link.startsWith("http")
            ? user.avatar_link
            : `${user.avatar_link}`
          : "",
      }));

      // Try to compute per-student average from score categories for the selected class so the list matches DetailScore
      try {
        if (selectedClassId && token) {
          let cats = [];
          try {
            const data = await getScoreCategoriesByClass(
              selectedClassId,
              token,
              dispatch
            );
            cats = Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
              ? data.data
              : [];
          } catch (e) {
            console.warn(
              "Could not fetch categories for averaging, falling back to personal_score",
              e?.message || e
            );
            cats = [];
          }

          if (cats && cats.length > 0) {
            // compute weighted average per user
            mapped = mapped.map((u) => {
              let weightedSum = 0;
              let sumWeights = 0;

              // try to find raw groupStudent entry that corresponds to this mapped user (if any)
              const extractGSId = (s) =>
                String(
                  s?.userId ??
                    s?.user_id ??
                    s?.groupStudentId ??
                    s?.studentId ??
                    s?.id ??
                    s?.user?._id ??
                    ""
                ).trim();
              const extractGSEmail = (s) =>
                String(s?.email ?? s?.user?.email ?? "").toLowerCase();
              const extractGSWorkId = (s) =>
                String(
                  s?.work_id ?? s?.user?.work_id ?? s?.workId ?? ""
                ).toLowerCase();

              const rawMatch = (groupStudents || []).find((gs) => {
                const sid = extractGSId(gs);
                if (!sid) return false;
                // compare with mapped user ids/emails
                const candidates = new Set(
                  [
                    u._id,
                    u.id,
                    u.user_id,
                    String(u.id || ""),
                    String(u._id || ""),
                  ]
                    .filter(Boolean)
                    .map(String)
                );
                if (candidates.has(sid)) return true;
                const semail = extractGSEmail(gs);
                if (
                  semail &&
                  u.email &&
                  String(u.email).toLowerCase() === semail
                )
                  return true;
                const swork = extractGSWorkId(gs);
                if (swork && u.id && String(u.id).toLowerCase() === swork)
                  return true;
                return false;
              });

              const uidCandidates = new Set(
                [
                  u._id,
                  u.id,
                  u.user_id,
                  u.work_id,
                  rawMatch?.groupStudentId,
                  rawMatch?.userId,
                  rawMatch?.id,
                  rawMatch?._id,
                ]
                  .filter(Boolean)
                  .map(String)
              );

              cats.forEach((c) => {
                const w =
                  typeof c.scoreCategoryWeight === "number" &&
                  !Number.isNaN(c.scoreCategoryWeight)
                    ? c.scoreCategoryWeight
                    : 0;
                if (!Array.isArray(c.scoreItems) || w <= 0) return;
                // find score item for this user (robust id matching + email fallback)
                const si = c.scoreItems.find((si) => {
                  const sid = String(
                    si.userId ?? si.user_id ?? si._id ?? si.id ?? ""
                  ).trim();
                  if (sid && uidCandidates.has(sid)) return true;
                  // fallback: match by email if available
                  const siEmail = String(
                    si.email ?? si.userEmail ?? si.user?.email ?? ""
                  ).toLowerCase();
                  if (
                    siEmail &&
                    u.email &&
                    String(u.email).toLowerCase() === siEmail
                  )
                    return true;
                  return false;
                });
                const val =
                  si &&
                  si.scoreItemValue !== null &&
                  si.scoreItemValue !== undefined &&
                  !Number.isNaN(Number(si.scoreItemValue))
                    ? Number(si.scoreItemValue)
                    : NaN;
                if (!Number.isNaN(val)) {
                  weightedSum += val * w;
                  sumWeights += w;
                }
              });
              const avg =
                sumWeights > 0
                  ? weightedSum / sumWeights
                  : typeof u.average === "number"
                  ? u.average
                  : 0;
              return {
                ...u,
                average: Number(avg.toFixed(2)),
                status: avg >= 5,
              };
            });
          }
        }
      } catch (e) {
        console.error("Error computing averages from categories", e);
      }

      // If current user is a student, only show the logged-in student's row
      if (isStudent) {
        // build candidate ids to match against mapped entries and raw groupStudents
        const candidateIds = new Set(
          [
            uid,
            tokenId,
            String(user?.user_id || ""),
            String(user?.work_id || ""),
            String(user?._id || ""),
            String(user?.id || ""),
          ].filter(Boolean)
        );
        const candidateEmail = user?.email
          ? String(user.email).toLowerCase()
          : "";
        const candidateUsername = user?.username
          ? String(user.username).toLowerCase()
          : "";

        const matches = mapped.filter((m) => {
          const mid = String(m._id || m.id || "").trim();
          const memail = String(m.email || "").toLowerCase();
          const mname = String(m.name || "").toLowerCase();
          if (candidateIds.has(mid)) return true;
          if (candidateEmail && memail && candidateEmail === memail)
            return true;
          if (candidateUsername && mname && mname.includes(candidateUsername))
            return true;
          return false;
        });

        if (matches.length > 0) {
          mapped = matches;
        } else {
          // fallback: find the raw groupStudents entry that corresponds to the logged-in user and create a placeholder
          const extractGSId = (s) =>
            String(
              s?.userId ??
                s?.user_id ??
                s?.groupStudentId ??
                s?.studentId ??
                s?.id ??
                s?.user?._id ??
                ""
            ).trim();
          const rawMatch = groupStudents.find((gs) => {
            const sid = extractGSId(gs);
            if (candidateIds.has(sid)) return true;
            const semail = String(
              gs?.email ?? gs?.user?.email ?? ""
            ).toLowerCase();
            if (candidateEmail && semail && candidateEmail === semail)
              return true;
            const susername = String(
              gs?.username ?? gs?.user?.username ?? gs?.user_name ?? ""
            ).toLowerCase();
            if (
              candidateUsername &&
              susername &&
              susername.includes(candidateUsername)
            )
              return true;
            return false;
          });
          if (rawMatch) {
            mapped = [
              {
                _id:
                  rawMatch.groupStudentId ||
                  rawMatch.userId ||
                  String(rawMatch.id || ""),
                name:
                  rawMatch.name ||
                  rawMatch.userId ||
                  candidateUsername ||
                  "You",
                email: rawMatch.email || "",
                id: rawMatch.userId || rawMatch.groupStudentId || "",
                status: true,
                average: 0,
                avatar: "",
              },
            ];
          } else {
            // no match at all: clear list (student sees nothing)
            mapped = [];
          }
        }
      }

      if (!mapped || mapped.length === 0) {
        const fallback = groupStudents.map((gs, idx) => ({
          _id: gs.groupStudentId || gs.userId || idx,
          name: gs.userId || "Unknown",
          email: "",
          id: gs.userId || "",
          status: true,
          average: 0,
          avatar: "",
        }));
        setStudents(isStudent ? [] : fallback);
      } else {
        setStudents(mapped);
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentSemesterId || !token) return;
    let mounted = true;
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClasses(currentSemesterId, token, dispatch);
        if (!mounted) return;
        console.debug("[GradesComponents] uid, role:", uid, role);
        console.debug(
          "[GradesComponents] tokenPayload, tokenId:",
          tokenPayload,
          tokenId
        );
        console.debug("[GradesComponents] getClasses result:", data);
        const normalized = Array.isArray(data) ? data : [];
        setClasses(normalized);
        // extract groups (areas) from all classes using API field names groupsId/groupsName
        const groups = normalized.flatMap((c) =>
          (c.groups || []).map((g) => ({
            _id: g.groupsId || g.groupId || g.id,
            name: g.groupsName || g.groupName || g.name || "Group",
            raw: g,
            classId: c.classesId || c._id,
          }))
        );
        // remove duplicates by _id
        const uniq = [];
        const map = new Map();
        for (const g of groups) {
          if (!g._id) continue;
          if (!map.has(g._id)) {
            map.set(g._id, true);
            uniq.push(g);
          }
        }
        setArea(uniq);
        // If there is at least one class, auto-select the first class and its first group
        if (normalized.length > 0) {
          const firstClass = normalized[0];
          const firstClassId = firstClass.classesId || firstClass._id;
          // set selected class
          setSelectedClassId(firstClassId);
          // determine its groups
          const firstGroups = (firstClass.groups || []).map((g) => ({
            _id: g.groupsId || g.groupId || g.id,
            name: g.groupsName || g.groupName || g.name || "Group",
            raw: g,
          }));
          if (firstGroups.length > 0) {
            console.debug(
              "[GradesComponents] firstGroups for firstClass:",
              firstGroups.map((f) => ({
                id: f._id,
                students: (f.raw?.groupStudents || []).length,
              }))
            );
            // if the current user is a student, find the group that contains them and only expose that group
            if (isStudent) {
              // robust membership test: try several possible id fields and compare as strings;
              // fall back to matching by email, username, or work_id when available
              if (!uid) {
                console.debug("[GradesComponents] user object (no uid):", user);
                console.debug(
                  "[GradesComponents] decoded token payload (no uid):",
                  tokenPayload,
                  tokenId
                );
              }
              const extractGSId = (s) =>
                String(
                  s?.userId ??
                    s?.user_id ??
                    s?.groupStudentId ??
                    s?.studentId ??
                    s?.id ??
                    s?.user?._id ??
                    ""
                );
              const extractGSEmail = (s) =>
                String(
                  s?.email ?? s?.user?.email ?? s?.user_email ?? ""
                ).toLowerCase();
              const extractGSUsername = (s) =>
                String(
                  s?.username ?? s?.user?.username ?? s?.user_name ?? ""
                ).toLowerCase();
              const extractGSWorkId = (s) =>
                String(
                  s?.work_id ??
                    s?.user?.work_id ??
                    s?.workId ??
                    s?.user?.workId ??
                    ""
                ).toLowerCase();
              const userAltIds = new Set(
                [
                  uid,
                  tokenId,
                  String(user?.user_id || ""),
                  String(user?.work_id || ""),
                  String(user?._id || ""),
                  String(user?.id || ""),
                ].filter(Boolean)
              );
              const userEmail = user?.email
                ? String(user.email).toLowerCase()
                : "";
              const userName = user?.username
                ? String(user.username).toLowerCase()
                : "";
              const userWorkId = user?.work_id
                ? String(user.work_id).toLowerCase()
                : "";
              const myGroup = firstGroups.find(
                (g) =>
                  Array.isArray(g.raw?.groupStudents) &&
                  g.raw.groupStudents.some((s) => {
                    const sid = extractGSId(s);
                    const semail = extractGSEmail(s);
                    const susername = extractGSUsername(s);
                    const swork = extractGSWorkId(s);
                    const matchedById = sid && userAltIds.has(sid);
                    const matchedByEmail =
                      userEmail && semail && userEmail === semail;
                    const matchedByUsername =
                      userName && susername && userName === susername;
                    const matchedByWorkId =
                      userWorkId && swork && userWorkId === swork;
                    const matched =
                      matchedById ||
                      matchedByEmail ||
                      matchedByUsername ||
                      matchedByWorkId;
                    if (!matched)
                      console.debug(
                        "[GradesComponents] group student id mismatch",
                        {
                          sid,
                          semail,
                          susername,
                          swork,
                          uid,
                          alt: Array.from(userAltIds),
                          userEmail,
                          userName,
                          userWorkId,
                        }
                      );
                    return matched;
                  })
              );
              if (myGroup) {
                setArea([myGroup]);
                setSelectedGroupId(String(myGroup._id));
                const groupStudents = myGroup.raw?.groupStudents || [];
                console.debug(
                  "[GradesComponents] matched groupStudents ids:",
                  groupStudents.map((gs) => extractGSId(gs))
                );
                if (groupStudents.length > 0)
                  fetchProfilesForGroupStudents(groupStudents);
                else setStudents([]);
              } else {
                // student isn't in any group for this class
                setArea([]);
                setSelectedGroupId("");
                setStudents([]);
              }
            } else {
              const firstGroup = firstGroups[0];
              setArea(firstGroups);
              setSelectedGroupId(String(firstGroup._id));
              // fetch students for this group
              const groupStudents = firstGroup.raw?.groupStudents || [];
              if (groupStudents.length > 0) {
                fetchProfilesForGroupStudents(groupStudents);
              } else {
                setStudents([]);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load classes/groups", e);
        if (!mounted) return;
        setError(e.message || "Failed to load classes");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchClasses();
    return () => {
      mounted = false;
    };
  }, [currentSemesterId, token, dispatch, uid]);

  // reset student page when classes list changes
  React.useEffect(() => {
    setStudentPage(1);
  }, [classes]);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setSelectedGroupId("");
    // find selected class and set its groups only
    const cls = classes.find(
      (c) =>
        String(c.classesId) === String(classId) ||
        String(c._id) === String(classId)
    );
    const groups = (cls?.groups || []).map((g) => ({
      _id: g.groupsId || g.groupId || g.id,
      name: g.groupsName || g.groupName || g.name || "Group",
      raw: g,
    }));
    // If user is a student, restrict groups to the one they belong to (if any)
    console.debug("[GradesComponents] handleClassChange uid, role:", uid, role);
    console.debug(
      "[GradesComponents] tokenPayload, tokenId:",
      tokenPayload,
      tokenId
    );
    console.debug(
      "[GradesComponents] groups for selected class:",
      groups.map((g) => ({
        id: g._id,
        count: (g.raw?.groupStudents || []).length,
      }))
    );
    if (isStudent) {
      if (!uid) {
        console.debug("[GradesComponents] user object (no uid):", user);
        console.debug(
          "[GradesComponents] decoded token payload (no uid):",
          tokenPayload,
          tokenId
        );
      }
      const extractGSId = (s) =>
        String(
          s?.userId ??
            s?.user_id ??
            s?.groupStudentId ??
            s?.studentId ??
            s?.id ??
            s?.user?._id ??
            ""
        );
      const extractGSEmail = (s) =>
        String(s?.email ?? s?.user?.email ?? s?.user_email ?? "").toLowerCase();
      const extractGSUsername = (s) =>
        String(
          s?.username ?? s?.user?.username ?? s?.user_name ?? ""
        ).toLowerCase();
      const extractGSWorkId = (s) =>
        String(
          s?.work_id ?? s?.user?.work_id ?? s?.workId ?? s?.user?.workId ?? ""
        ).toLowerCase();
      const userAltIds = new Set(
        [
          uid,
          tokenId,
          String(user?.user_id || ""),
          String(user?.work_id || ""),
          String(user?._id || ""),
          String(user?.id || ""),
        ].filter(Boolean)
      );
      const userEmail = user?.email ? String(user.email).toLowerCase() : "";
      const userName = user?.username
        ? String(user.username).toLowerCase()
        : "";
      const userWorkId = user?.work_id
        ? String(user.work_id).toLowerCase()
        : "";
      const myGroup = groups.find(
        (g) =>
          Array.isArray(g.raw?.groupStudents) &&
          g.raw.groupStudents.some((s) => {
            const sid = extractGSId(s);
            const semail = extractGSEmail(s);
            const susername = extractGSUsername(s);
            const swork = extractGSWorkId(s);
            const matchedById = sid && userAltIds.has(sid);
            const matchedByEmail = userEmail && semail && userEmail === semail;
            const matchedByUsername =
              userName && susername && userName === susername;
            const matchedByWorkId = userWorkId && swork && userWorkId === swork;
            const matched =
              matchedById ||
              matchedByEmail ||
              matchedByUsername ||
              matchedByWorkId;
            if (!matched)
              console.debug(
                "[GradesComponents] handleClassChange group student id mismatch",
                {
                  sid,
                  semail,
                  susername,
                  swork,
                  uid,
                  alt: Array.from(userAltIds),
                  userEmail,
                  userName,
                  userWorkId,
                }
              );
            return matched;
          })
      );
      if (myGroup) {
        setArea([myGroup]);
        setSelectedGroupId(String(myGroup._id));
        const groupStudents = myGroup.raw?.groupStudents || [];
        console.debug(
          "[GradesComponents] matched groupStudents ids:",
          groupStudents.map((gs) => extractGSId(gs))
        );
        if (groupStudents.length > 0)
          fetchProfilesForGroupStudents(groupStudents);
        else setStudents([]);
      } else {
        setArea([]);
        setSelectedGroupId("");
        setStudents([]);
      }
    } else {
      setArea(groups);
      // if there are groups, auto-select the first one and fetch its students
      if (groups.length > 0) {
        const g0 = groups[0];
        setSelectedGroupId(String(g0._id));
        const groupStudents = g0.raw?.groupStudents || [];
        if (groupStudents.length > 0)
          fetchProfilesForGroupStudents(groupStudents);
        else setStudents([]);
      } else {
        setSelectedGroupId("");
        setStudents([]);
      }
    }
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    // find selected group in current area
    const grp = area.find((g) => g._id === groupId);
    // if group has groupStudents, map to student objects (if user details not available, show placeholder ids)
    const groupStudents = grp?.raw?.groupStudents || [];
    if (groupStudents.length === 0) {
      setStudents([]);
    } else {
      // fetch profiles using shared helper
      fetchProfilesForGroupStudents(groupStudents);
    }
    setCurrentPage(1);
  };
  return (
    <div className="grades__component">
      <div className="grades__component__container">
        <div className="grades__component__container__filter__class">
          <div className="grades__component__container__filter__class__feature">
            {/* Student view: show list of classes & groups; clicking a group opens Detail for the current student */}
            {isStudent ? (
              (() => {
                const candidateIds = new Set([
                  uid,
                  tokenId,
                  String(user?.user_id || ""),
                  String(user?.work_id || ""),
                ].filter(Boolean));

                const candidateEmail = user?.email ? String(user.email).toLowerCase() : "";

                const groupHasStudent = (g) => {
                  const groupStudents = g.groupStudents || g.raw?.groupStudents || [];
                  if (!Array.isArray(groupStudents) || groupStudents.length === 0) return false;
                  return groupStudents.some((s) => {
                    const sid = String(s?.userId ?? s?.user_id ?? s?.groupStudentId ?? s?.id ?? s?._id ?? "");
                    if (sid && candidateIds.has(sid)) return true;
                    const semail = String(s?.email ?? s?.user?.email ?? "").toLowerCase();
                    if (candidateEmail && semail && candidateEmail === semail) return true;
                    const swork = String(s?.work_id ?? s?.user?.work_id ?? "").toLowerCase();
                    const candidateWork = String(user?.work_id || "").toLowerCase();
                    if (candidateWork && swork && candidateWork === swork) return true;
                    return false;
                  });
                };

                // Build a student object that includes multiple identifier fields
                // so DetailScore can reliably match scoreItems regardless of id shape.
                const currentStudent = {
                  _id: user?._id || user?.user_id || user?.id || uid || tokenId,
                  userId: user?.user_id || uid || tokenId,
                  work_id: user?.work_id || user?.workId || "",
                  id: user?.work_id || user?.user_id || user?.id || uid || tokenId,
                  name: user?.full_name || user?.work_id || user?.user_id || user?.username || "You",
                  email: user?.email || "",
                  avatar: user?.avatar_link || "",
                };

                // Find classes that have at least one group containing the student
                const studentClasses = (classes || [])
                  .map((c) => {
                    const groups = (c.groups || []).filter((g) => groupHasStudent(g));
                    return groups.length > 0 ? { class: c, groups } : null;
                  })
                  .filter(Boolean);

                // pagination for studentClasses (client-side)
                const totalStudentPages = Math.max(1, Math.ceil(studentClasses.length / classesPerPage));
                const startIdx = (studentPage - 1) * classesPerPage;
                const pagedStudentClasses = studentClasses.slice(startIdx, startIdx + classesPerPage);

                return (
                  <div className="student-list-wrapper">
                    <div className="student-class-list">
                      {studentClasses.length === 0 ? (
                        loading ? (
                          <div>Loading...</div>
                        ) : (
                          <div>No classes available.</div>
                        )
                      ) : (
                        pagedStudentClasses.map(({ class: cls, groups }) => (
                          <div key={cls.classesId || cls._id} className="student-class-item">
                            {groups.map((g) => {
                              const gid = g.groupsId || g.groupId || g.id;
                              const gname = g.groupsName || g.groupName || g.name || "Unnamed group";
                              const cname = cls.classesName || cls.name || cls.className || "Unnamed class";
                              // robust group description lookup (try several common fields)
                              const gdesc =
                                g.groupsDescriptions ||
                                "Unassigned";
                              const mainLabel = `Class ${cname}, Group ${gname}`;
                              const fullLabel = gdesc
                                ? `${mainLabel} (Descriptions: ${gdesc})`
                                : mainLabel;
                              return (
                                <div key={gid} className="student-class-item--combined">
                                  <button
                                    className={`student-group-button ${gname === 'unassigned' ? 'unassigned' : ''}`}
                                    onClick={() =>
                                      handleActiveDetail({
                                        student: currentStudent,
                                        classId: cls.classesId || cls._id,
                                        groupId: gid,
                                      })
                                    }
                                    title={fullLabel}
                                  >
                                    <span className="student-group-button__main">{mainLabel}</span>
                                    {gdesc ? (
                                      <span className="student-group-button__desc">{`Descriptions: ${gdesc}`}</span>
                                    ) : null}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>

                    {/* pagination controls for student class list */}
                    {studentClasses.length > classesPerPage && (
                      <div className="pagination student-pagination">
                        <button
                          className="pagination__button"
                          onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                          disabled={studentPage === 1}
                        >
                          <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <span className="pagination__info" style={{ marginLeft: 8, marginRight: 8 }}>
                          {studentPage} / {totalStudentPages}
                        </span>
                        <button
                          className="pagination__button"
                          onClick={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                          disabled={studentPage === totalStudentPages}
                        >
                          <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              // Lecturer: keep original select dropdowns
              <>
                <select
                  aria-label="Select class"
                  onChange={handleClassChange}
                  value={selectedClassId}
                >
                  {loading ? (
                    <option value="" disabled>
                      Loading...
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        -- Class --
                      </option>
                      {classes.map((item) => (
                        <option
                          key={item.classesId || item._id}
                          value={item.classesId || item._id}
                        >
                          {item.classesName || item.name || item.className || "Unnamed class"}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                <select
                  aria-label="Select group"
                  onChange={handleGroupChange}
                  value={selectedGroupId}
                  disabled={isStudent}
                >
                  {loading ? (
                    <option value="" disabled>
                      Loading...
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        -- Group --
                      </option>
                      {area.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name || item.groupsName || item.groupName || "Unnamed group"}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </>
            )}
          </div>
          <div className="grades__component__container__filter__class__icon">
            <i className="fa-solid fa-file-arrow-down"></i>
            <i className="fa-solid fa-file-arrow-up"></i>
            {user?.role === "LECTURER" && (
              <>
                <button onClick={() => setIsAddOpen(true)} title="Add">
                  <i className="fa-solid fa-plus"></i>
                  <span>Category</span>
                </button>
                <button
                  onClick={() => setIsReuseOpen(true)}
                  title={
                    selectedClassId ? "Add (Reuse)" : "Select a class first"
                  }
                  style={{ marginLeft: 8 }}
                  disabled={
                    !selectedClassId && (!classes || classes.length === 0)
                  }
                >
                  <i className="fa-solid fa-copy" style={{ marginLeft: 6 }}></i>
                  <span>Category (Reuse)</span>
                </button>
              </>
            )}
          </div>
        </div>
        {isAddOpen && (
          <div className="modal__overlay">
            <div className="modal__card">
              <h3>Create score category</h3>
              <div className="modal__fields">
                <div className="modal__field">
                  <label className="modal__label">Name</label>
                  <input
                    className="modal__input"
                    placeholder="Enter category name"
                    value={newCategory.scoreCategoryName}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        scoreCategoryName: e.target.value,
                      })
                    }
                    aria-label="Category name"
                  />
                </div>

                <div className="modal__field">
                  <label className="modal__label">Weight</label>
                  <div className="input--percent">
                    <input
                      className="modal__input"
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      value={
                        typeof newCategory.scoreCategoryWeight === "number"
                          ? newCategory.scoreCategoryWeight * 100
                          : ""
                      }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || 0);
                        setNewCategory({
                          ...newCategory,
                          scoreCategoryWeight: isNaN(val) ? 0 : val / 100,
                        });
                      }}
                      aria-label="Category weight percent"
                    />
                    <span className="percent__suffix">%</span>
                  </div>
                  <small className="modal__hint">
                    Enter percentage, e.g. 10 for 10%
                  </small>
                </div>

                <div className="modal__field">
                  <label className="modal__label">Comment</label>
                  <textarea
                    className="modal__textarea"
                    placeholder="Optional comment"
                    value={newCategory.scoreCategoryComment}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        scoreCategoryComment: e.target.value,
                      })
                    }
                    rows={3}
                    aria-label="Category comment"
                  />
                </div>
              </div>
              <div className="modal__actions">
                <button
                  onClick={() => setIsAddOpen(false)}
                  disabled={savingCategory}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // only lecturers allowed, defensive check
                    if (user?.role !== "LECTURER") return;
                    // Validation: require name and a positive weight before creating
                    const nameTrim = (newCategory.scoreCategoryName || "").trim();
                    if (!nameTrim) {
                      alert("Category name is required");
                      return;
                    }
                    if (typeof newCategory.scoreCategoryWeight !== 'number' || Number.isNaN(newCategory.scoreCategoryWeight) || newCategory.scoreCategoryWeight <= 0) {
                      alert("Category weight is required and must be greater than 0");
                      return;
                    }
                    // ensure class selected
                    const classId =
                      selectedClassId ||
                      (classes[0] && (classes[0].classesId || classes[0]._id));
                    if (!classId) {
                      alert("Please select a class first");
                      return;
                    }
                    const comment = (
                      newCategory.scoreCategoryComment || ""
                    ).trim();
                    const payload = {
                      scoreCategoryId: null,
                      scoreCategoryName: newCategory.scoreCategoryName,
                      scoreCategoryWeight: newCategory.scoreCategoryWeight,
                      scoreCategoryComment: comment === "" ? null : comment,
                      classId,
                      scoreItems: [],
                    };

                    // Validation: ensure total weights (existing + new) do not exceed 100%
                    try {
                      setSavingCategory(true);
                      // fetch existing categories for this class
                      let existing = [];
                      try {
                        const data = await getScoreCategoriesByClass(
                          classId,
                          token,
                          dispatch
                        );
                        existing = Array.isArray(data)
                          ? data
                          : Array.isArray(data?.data)
                          ? data.data
                          : [];
                      } catch (e) {
                        // if fetch fails, allow create to proceed (server will still validate) but warn
                        console.warn(
                          "Could not fetch existing categories to validate total weight, proceeding with server-side validation",
                          e?.message || e
                        );
                        existing = [];
                      }

                      const sumExisting = existing.reduce(
                        (s, c) =>
                          s +
                          (typeof c.scoreCategoryWeight === "number"
                            ? c.scoreCategoryWeight
                            : 0),
                        0
                      );
                      const proposedTotal =
                        sumExisting + (payload.scoreCategoryWeight || 0);
                      const EPS = 1e-9;
                      if (proposedTotal - 1.0 > EPS) {
                        alert(
                          "Cannot create category — total weight would exceed 100%"
                        );
                        setSavingCategory(false);
                        return;
                      }

                      // proceed to save
                      await saveScoreCategory(payload, token, dispatch);
                      // refresh categories for the class (optional)
                      try {
                        await getScoreCategoriesByClass(
                          classId,
                          token,
                          dispatch
                        );
                      } catch (e) {
                        /* ignore */
                      }
                      setIsAddOpen(false);
                      setNewCategory({
                        scoreCategoryName: "",
                        scoreCategoryWeight: 0,
                        scoreCategoryComment: "",
                      });
                    } catch (e) {
                      console.error("Failed to save category", e);
                      alert("Failed to save category: " + (e?.message || e));
                    } finally {
                      setSavingCategory(false);
                    }
                  }}
                  disabled={
                    savingCategory ||
                    !(newCategory.scoreCategoryName && String(newCategory.scoreCategoryName).trim()) ||
                    !(typeof newCategory.scoreCategoryWeight === 'number') ||
                    newCategory.scoreCategoryWeight <= 0
                  }
                >
                  {savingCategory ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
        {isReuseOpen && (
          <AddCategoryByReuse
            classId={
              selectedClassId ||
              (classes[0] && (classes[0].classesId || classes[0]._id))
            }
            token={token}
            dispatch={dispatch}
            onClose={() => setIsReuseOpen(false)}
          />
        )}
        {!isStudent && (
          <div className="grades__component__container__table__list">
            <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Student</th>
                <th>Gmail</th>
                <th>ID</th>
                <th>Average</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "16px" }}
                  >
                    Loading students...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>
                      <p style={{ paddingTop: "15px" }}>{index + 1}</p>
                    </td>
                    <td>
                      <div className="name__ava">
                        <img
                          src={item.avatar || "/default-avatar.png"}
                          alt={item.name || "avatar"}
                        />
                        <p>{item.name}</p>
                      </div>
                    </td>
                    <td>
                      <p>{item.email}</p>
                    </td>
                    <td>
                      <p>{item.id}</p>
                    </td>
                    {/* Average column (numeric, 2 decimals) */}
                    <td>
                      {(() => {
                        const raw =
                          typeof item.average === "number"
                            ? item.average
                            : parseFloat(item.average) || 0;
                        const avg = Number.isFinite(raw) ? Number(raw) : 0;
                        const passed = avg >= 5;
                        return (
                          <p
                            style={{ paddingLeft: "15px" }}
                            className={passed ? "isPassed" : "notPassed"}
                          >
                            {avg.toFixed(2)}
                          </p>
                        );
                      })()}
                    </td>

                    {/* Status column (Passed / Not passed) */}
                    <td>
                      {(() => {
                        const raw =
                          typeof item.average === "number"
                            ? item.average
                            : parseFloat(item.average) || 0;
                        const avg = Number.isFinite(raw) ? Number(raw) : 0;
                        const passed = avg >= 5;
                        return (
                          <span className={passed ? "isPassed" : "notPassed"}>
                            {passed ? "Passed" : "Not passed"}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className="btn__see__detail"
                        onClick={() =>
                          handleActiveDetail({
                            student: item,
                            classId: selectedClassId,
                            groupId: selectedGroupId,
                          })
                        }
                      >
                        Detail
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "16px" }}
                  >
                    {selectedClassId && selectedGroupId
                      ? "No students in this group."
                      : "Please select a class and group."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

        <div className="pagination">
          {students.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="pagination__info">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination__button"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradesComponents;
