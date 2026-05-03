const map = new Map();
const DELAY = 2000;

const isLimited = (id) => {
  const now = Date.now();
  const last = map.get(id) || 0;

  if (now - last < DELAY) return true;

  map.set(id, now);
  return false;
};

export default { isLimited };