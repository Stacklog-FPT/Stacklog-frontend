// ------- utils/date.js -------
function parseFlexibleDate(input, opts = { naiveAsLocal: true }) {
  if (!input && input !== 0) return null;

  // Date object
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  // timestamp number
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  // string
  if (typeof input !== "string") return null;
  const str = input.trim();
  if (!str) return null;

  // Có 'Z' hoặc offset ±HH:MM -> cho JS parse chuẩn UTC
  if (/Z$|[+\-]\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO "naive" (không timezone): YYYY-MM-DD[ T]HH:mm[:ss][.sss] hoặc chỉ YYYY-MM-DD
  const m = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/
  );
  if (m) {
    const [, Y, M, D, H = "0", Min = "0", Sec = "0", Ms = "0"] = m;
    const y = +Y,
      mo = +M - 1,
      d = +D,
      h = +H,
      mi = +Min,
      s = +Sec,
      ms = +Ms;

    // Chọn cách hiểu "naive": Local (thường mong muốn trên UI) hoặc UTC
    const date = opts.naiveAsLocal
      ? new Date(y, mo, d, h, mi, s, ms)
      : new Date(Date.UTC(y, mo, d, h, mi, s, ms));

    return isNaN(date.getTime()) ? null : date;
  }

  // Fallback: để JS tự parse các format khác
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export const formatDateUI = (value, opts = {}) => {
  const { withTime = false, naiveAsLocal = true } = opts;
  const d = parseFlexibleDate(value, { naiveAsLocal });
  if (!d) return "";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  if (!withTime) return `${dd}/${mm}/${yyyy}`;

  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};
