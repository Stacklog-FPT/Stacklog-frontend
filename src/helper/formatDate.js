function parseFlexibleDate(input) {
  if (!input && input !== 0) return null;

  if (input instanceof Date) return isNaN(input) ? null : input;
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d) ? null : d;
  }
  if (typeof input !== 'string') return null;

  const s = input.trim();
  if (!s) return null;

  if (/Z$|[+\-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?)?$/);
  if (m) {
    const [, Y, M, D, h = '0', mnt = '0', s = '0'] = m;
    const d = new Date(Number(Y), Number(M) - 1, Number(D), Number(h), Number(mnt), Number(s));
    return isNaN(d) ? null : d;
  }

  const d = new Date(s);
  return isNaN(d) ? null : d;
}

export const formatDateUI = (value, opts = {}) => {
  const { withTime = false } = opts;
  const d = parseFlexibleDate(value);
  if (!d) return '';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  if (!withTime) return `${dd}/${mm}/${yyyy}`;

  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};
