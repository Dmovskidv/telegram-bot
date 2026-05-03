const MAX_HISTORY = 10;
const TTL = 1000 * 60 * 60;

const sessions = new Map();

const SYSTEM_PROMPT = {
  role: "system",
  content: `
    You are an AI assistant inside a Telegram bot.

    Your goals:
    - Give clear, concise, and structured answers
    - Avoid unnecessary introductions and filler text
    - Focus on practical, useful information

    Formatting rules (VERY IMPORTANT):
    - Use HTML-compatible formatting for Telegram
    - Use <b> for headings and important parts
    - Use <code> for inline code
    - Use <pre><code> for code blocks
    - Use bullet points (•) for lists
    - Keep messages readable on mobile (short paragraphs)

    Content rules:
    - Be direct and to the point
    - Prefer structured responses over long text
    - Break complex topics into sections
    - When explaining code, give examples
    - If the question is technical, act like a senior developer

    Behavior:
    - If the question is unclear — ask a short clarifying question
    - If multiple solutions exist — show the best one first
    - Avoid repeating the user's question
    - Do not hallucinate unknown facts

    Context awareness:
    - You are chatting in Telegram, not a web app
    - Keep responses compact (Telegram has message limits)
    - Avoid markdown tables unless necessary

    Tone:
    - Professional but friendly
    - No emojis unless they add clarity
    - No fluff

    Language:
    - Reply in the same language as the user
    - Do NOT use <br>, <ul>, <li>, <p>
    - Use plain text line breaks (\n)
    - Use "• " for lists
  `,
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