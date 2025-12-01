import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthProvider";
import { useParams } from "react-router-dom";
import { selectCurrentSemesterId } from "../../redux/slice/semesterSlice";
import { getClasses } from "../../service/ClassService";
import TaskCard from "../../components/ComponentsOverallTask/TaskCard";
import IncompleteTasksChart from "../../components/ComponentsOverallTask/IncompleteTasksChart";
import TaskCompletionChart from "../../components/ComponentsOverallTask/TaskCompletionChart";
import UpcomingTasksChart from "../../components/ComponentsOverallTask/UpcomingTasksChart";
import avatarDefault from "../../assets/ava-chat.png";
import TaskCompletionOverTime from "../../components/ComponentsOverallTask/TaskCompletionOverTime";
import { getOverallTask } from "../../service/TaskService";
import GroupAverage from "../../components/ComponentsOverallTask/GroupAverage";
import { fetchUserById } from "../../service/UserService";
import "./OverallGroup.scss";

export default function TaskDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const token = user?.token || null;
  const { groupId: paramGroupId } = useParams();

  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const currentSemesterId = useSelector(selectCurrentSemesterId);
  const [classesId, setClassesId] = useState(null);
  

  useEffect(() => {
    const groupId = paramGroupId || null;
    if (!groupId || !token) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getOverallTask(token, groupId, dispatch);
        setOverall(data);
        // Debug: log potential class id fields for the selected group
        console.debug('OverallGroup - paramGroupId:', groupId);
        console.debug('OverallGroup - overall data keys:', data ? Object.keys(data) : data);
        console.debug('OverallGroup - possible classId fields:', {
          classId: data?.classId || data?.classesId || data?.classes?.classesId || data?.class?._id || null,
        });
        // fetch user profiles for userOverviews to get names & avatars
        if (data?.userOverviews && Array.isArray(data.userOverviews) && data.userOverviews.length > 0) {
          try {
            const baseAuth = 'http://103.166.183.142:8080/api/';
            const profiles = await Promise.all(
              data.userOverviews.map(async (u) => {
                try {
                  const p = await fetchUserById(token, u.userId);
                  // fetchUserById returns the user object (or throws)
                  return p || null;
                } catch (e) {
                  return null;
                }
              })
            );
            const map = {};
            profiles.forEach((p) => {
              if (!p) return;
              const id = p._id || p.user_id || p.userId || p.userId;
              const avatar_link = p.avatar_link || p.avatar || '';
              const avatarUrl = avatar_link
                ? avatar_link.startsWith('http')
                  ? avatar_link
                  : `${baseAuth}${avatar_link}`
                : null;
              map[id] = {
                full_name: p.full_name || p.fullName || p.fullname || p.name || id,
                avatar: avatarUrl,
                raw: p,
              };
            });
            setUsersMap(map);
          } catch (e) {
            // ignore profile enrichment errors
            console.warn('Failed to fetch user profiles for overall view', e);
          }
        }
        // also try to enrich memberContribution ids (in case they are different users)
        if (data?.memberContribution && typeof data.memberContribution === 'object') {
          try {
            const memberIds = Object.keys(data.memberContribution || {});
            const missing = memberIds.filter((id) => !usersMap[id]);
            if (missing.length) {
              const profiles2 = await Promise.all(
                missing.map(async (mid) => {
                  try {
                    return await fetchUserById(token, mid);
                  } catch (e) {
                    return null;
                  }
                })
              );
              const map2 = { ...usersMap };
              profiles2.forEach((p) => {
                if (!p) return;
                const id = p._id || p.user_id || p.userId || p.userId;
                const avatar_link = p.avatar_link || p.avatar || '';
                const avatarUrl = avatar_link
                  ? avatar_link.startsWith('http')
                    ? avatar_link
                    : `http://103.166.183.142:8080/api/${avatar_link}`
                  : null;
                map2[id] = {
                  full_name: p.full_name || p.fullName || p.fullname || p.name || id,
                  avatar: avatarUrl,
                  raw: p,
                };
              });
              setUsersMap(map2);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error('Failed to load overall task', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [paramGroupId, token]);

  // If we have a selected semester and the groupId, try to find the class that contains this group
  useEffect(() => {
    const groupId = paramGroupId || null;
    if (!groupId || !token || !currentSemesterId) return;

    (async () => {
      try {
        const classes = await getClasses(currentSemesterId, token, dispatch);
        if (Array.isArray(classes) && classes.length > 0) {
          const found = classes.find((c) =>
            Array.isArray(c.groups) && c.groups.some((g) => g.groupsId === groupId),
          );
          if (found) {
            const cid = found.classesId || found.classId || found._id || null;
            setClassesId(cid);
            console.debug('OverallGroup - resolved classesId for group:', groupId, '=>', cid);
          } else {
            console.debug('OverallGroup - no class found containing group:', groupId);
          }
        }
      } catch (e) {
        console.warn('OverallGroup - failed to resolve classes for group', e);
      }
    })();
  }, [paramGroupId, token, currentSemesterId]);

  

  // derive task cards from userOverviews (take up to 4)
  const taskStats = (overall?.userOverviews || []).slice(0, 4).map((u, idx) => ({
    id: u.userId || idx,
    percentage: Math.round((u.completionPercent || 0) * 100) / 100,
    title: (usersMap[u.userId] && usersMap[u.userId].full_name) || u.userId,
    description: `Remaining ${u.remainingTask} of ${u.totalTask}`,
    total: u.totalTask || 0,
    avatars: [(usersMap[u.userId] && usersMap[u.userId].avatar) || avatarDefault],
    buttonText: "View",
    // use uniform brand color for cards — previously the 4th card used 'orange'
    color: "teal",
  }));

  // prepare progress array for TaskCompletionChart
  const progressArray = overall
    ? Array.isArray(overall.taskCompletionRate)
      ? overall.taskCompletionRate.map((s, i) => ({
          _id: s?.statusTaskId || s?._id || i + 1,
          name: s?.statusTaskName || s?.name || `Item ${i + 1}`,
          progress: Number(s?.taskCompletionRate ?? s?.progress ?? 0),
          color: s?.colorCode || s?.color || (String(s?.statusTaskName || '').toLowerCase().includes('complete') ? '#045745' : '#edf2f2'),
        }))
      : Object.keys(overall.taskCompletionRate || {}).map((k, i) => ({
          _id: i + 1,
          name: k,
          progress: overall.taskCompletionRate[k],
          color:
            k.toLowerCase().includes('complete') || k.toLowerCase().includes('completed')
              ? '#045745'
              : k.toLowerCase().includes('over') || k.toLowerCase().includes('overdue')
              ? '#f97316'
              : '#edf2f2',
        }))
    : null;

  // member contributions for IncompleteTasksChart
  const memberData = overall
    ? Object.keys(overall.memberContribution || {}).map((uid) => ({
        name: (usersMap[uid] && usersMap[uid].full_name) || uid,
        value:
          // prefer computed per-member scores if available, otherwise fall back to raw contribution value
          typeof overall.memberComputedScores !== 'undefined' && overall.memberComputedScores[uid] !== undefined
            ? overall.memberComputedScores[uid]
            : overall.memberContribution[uid],
      }))
    : null;

  // upcoming deadlines
  const upcoming = overall?.upcomingDeadlines || [];

  return (
    <div className="task-dashboard">
      <div className="dashboard-container">
        {/* Task Status Cards */}
        <div className="task-cards-grid">
          {(taskStats.length ? taskStats : [
            { id: 'placeholder', percentage: 0, title: 'No data', description: '', total: 0, avatars: [avatarDefault], buttonText: '—', color: 'teal' }
          ]).map((stat) => (
            <TaskCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Group average score card (moved into its own component) */}
        <GroupAverage
          initialScore={overall?.groupAverageScore}
          groupId={paramGroupId}
          token={token}
          classId={classesId}
          memberContribution={overall?.memberContribution}
          usersMap={usersMap}
          onUpdate={(newScore) =>
            setOverall((o) => {
              const prev = o || {};
              const memberContrib = prev.memberContribution || {};
              const memberIds = Object.keys(memberContrib);
              const totalMembers = memberIds.length || 1;
              const memberComputedScores = {};
              // formula: (groupAverage * contributionPercent) / (100 / totalMembers)
              memberIds.forEach((uid) => {
                const contribPercent = Number(memberContrib[uid]) || 0;
                const computed = (Number(newScore) * contribPercent) / (100 / totalMembers);
                  const capped = Math.min(10, computed);
                  memberComputedScores[uid] = Number(Number(capped).toFixed(2));
              });
              return { ...prev, groupAverageScore: newScore, memberComputedScores };
            })
          }
        />

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Member contribution (%)</h3>
            </div>
            <IncompleteTasksChart data={memberData} />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Total tasks by completion status</h3>
            </div>
            <TaskCompletionChart progress={progressArray} totalTask={overall?.totalTask} />
          </div>
        </div>

        {/* Upcoming Tasks Chart */}
        {/* <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Upcoming deadlines</h3>
          </div>
          <UpcomingTasksChart data={upcoming} />
        </div> */}

        {/* Task Completion Over Time */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Task completion over time</h3>
          </div>
          <TaskCompletionOverTime data={upcoming} />
        </div>
      </div>
    </div>
  );
}
