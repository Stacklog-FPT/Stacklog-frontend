export const sortSemesterNewestFirst = (data = []) => {
  return [...data].sort((a, b) => {
    const aEnd = a.semesterEndDate
      ? new Date(a.semesterEndDate)
      : new Date("9999-12-31");

    const bEnd = b.semesterEndDate
      ? new Date(b.semesterEndDate)
      : new Date("9999-12-31");

    if (bEnd - aEnd !== 0) return bEnd - aEnd;

    const aStart = a.semesterStartDate
      ? new Date(a.semesterStartDate)
      : new Date(0);
    const bStart = b.semesterStartDate
      ? new Date(b.semesterStartDate)
      : new Date(0);

    return bStart - aStart;
  });
};
