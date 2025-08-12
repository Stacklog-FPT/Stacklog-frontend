import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,

  semesters: [],
  classes: [],
  groups: [],

  classIdsBySemesterId: {},
  groupIdsByClassId: {},

  currentSemesterId: null,
  currentClassId: null,
};

const semesterSlice = createSlice({
  name: 'semester',
  initialState,
  reducers: {
    getSemestersStart(state) {
      state.pending = true;
      state.error = null;
    },

    getSemestersSuccess(state, action) {
      state.pending = false;

      const list = action.payload?.data ?? action.payload ?? [];

      state.semesters = [];
      state.classes = [];
      state.groups = [];
      state.classIdsBySemesterId = {};
      state.groupIdsByClassId = {};

      for (const sem of list) {
        const semId = sem.id ?? sem._id;
        const semesterName = sem.semesterName;

        state.semesters.push({ id: semId, semesterName });

        const classArr = sem.classes ?? sem.semesterClass ?? [];
        state.classIdsBySemesterId[semId] = [];

        for (const cls of classArr) {
          const classId = cls.id ?? cls._id;
          state.classes.push({ id: classId, name: cls.name, semesterId: semId });
          state.classIdsBySemesterId[semId].push(classId);

          const groups = cls.groups ?? [];
          state.groupIdsByClassId[classId] = [];

          for (const g of groups) {
            const gid = g.id ?? g._id;
            state.groups.push({
              id: gid,
              groupName: g.groupName,
              groupsStudent: g.groupsStudent ?? [],
              classId,
              semesterId: semId,
            });
            state.groupIdsByClassId[classId].push(gid);
          }
        }
      }

      if (!state.currentSemesterId && state.semesters.length > 0) {
        state.currentSemesterId = state.semesters[0].id;
      }

      state.currentClassId = null;
    },

    getSemestersFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'Load semesters failed';
    },

    selectSemester(state, action) {
      state.currentSemesterId = action.payload ?? null;
      state.currentClassId = null;
    },
    selectClass(state, action) {
      state.currentClassId = action.payload ?? null;
    },
  },
});

export const {
  getSemestersStart,
  getSemestersSuccess,
  getSemestersFailure,
  selectSemester,
  selectClass,
} = semesterSlice.actions;

export default semesterSlice.reducer;

/* ---------------------- SELECTORS ---------------------- */
const self = (s) => s.semester;

export const selectPending = (s) => self(s).pending;
export const selectError = (s) => self(s).error;

export const selectSemesters = (s) => self(s).semesters;
export const selectClasses = (s) => self(s).classes;
export const selectGroups = (s) => self(s).groups;

export const selectCurrentSemesterId = (s) => self(s).currentSemesterId;
export const selectCurrentClassId = (s) => self(s).currentClassId;

export const selectCurrentSemester = createSelector(
  [selectSemesters, selectCurrentSemesterId],
  (sems, id) => sems.find((x) => x.id === id) || null,
);

export const selectClassesOfCurrentSemester = createSelector(
  [self, selectCurrentSemesterId],
  (st, semId) =>
    semId
      ? (st.classIdsBySemesterId[semId] || []).map((id) => st.classes.find((c) => c.id === id))
      : [],
);

export const selectCurrentClass = createSelector(
  [selectClasses, selectCurrentClassId],
  (classes, id) => classes.find((c) => c.id === id) || null,
);

export const selectGroupsOfCurrentClass = createSelector(
  [self, selectCurrentClassId],
  (st, classId) =>
    classId
      ? (st.groupIdsByClassId[classId] || []).map((id) => st.groups.find((g) => g.id === id))
      : [],
);

export const selectStudentsOfCurrentClass = createSelector([selectGroupsOfCurrentClass], (groups) =>
  groups.flatMap((g) => g.groupsStudent || []),
);
