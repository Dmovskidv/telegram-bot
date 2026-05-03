const MAX_HISTORY = 10;
const TTL = 1000 * 60 * 60;

const sessions = new Map();

const SYSTEM_PROMPT = {
  role: "system",
  content: "You are helpful assistant...",
};

const getSession = (chatId) => {
  const now = Date.now();

  if (!sessions.has(chatId)) {
    sessions.set(chatId, { history: [], lastUsed: now });
  }

  const session = sessions.get(chatId);
  session.lastUsed = now;

  return session;
};

const trimHistory = (history, maxChars = 4000) => {
  let total = 0;
  const result = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    total += msg.content.length;

    if (total > maxChars) break;

    result.unshift(msg);
  }

  return result;
};

const getHistory = (chatId) => {
  const session = getSession(chatId);

  return [SYSTEM_PROMPT, ...trimHistory(session.history)];
};

const addUserMessage = (chatId, text) => {
  const session = getSession(chatId);

  session.history.push({ role: "user", content: text });

  if (session.history.length > MAX_HISTORY) {
    session.history.shift();
  }
};

const addAssistantMessage = (chatId, text) => {
  const session = getSession(chatId);

  session.history.push({ role: "assistant", content: text });
};

const reset = (chatId) => {
  sessions.delete(chatId);
};

// TTL cleaner
setInterval(() => {
  const now = Date.now();

  for (const [id, session] of sessions.entries()) {
    if (now - session.lastUsed > TTL) {
      sessions.delete(id);
    }
  }
}, 1000 * 60 * 10);

export default {
  getHistory,
  addUserMessage,
  addAssistantMessage,
  reset,
};