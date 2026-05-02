import { Telegraf } from "telegraf";
import askAI from "./ai.service.js";

const MAX_HISTORY = 10;
const SESSION_TTL = 1000 * 60 * 60;
const sessions = new Map();

const SYSTEM_PROMPT = {
  role: "system",
  content: "You are helpful assistant..."
};

setInterval(
  () => {
    sessions.clear();
  },
  1000 * 60 * 60, // 1 hour
);

const escapeHtml = (text = "") => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const formatAIResponse = (text) => {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
};

const getSession = (chatId) => {
  const now = Date.now();

  if (!sessions.has(chatId)) {
    sessions.set(chatId, { history: [], lastUsed: now });
  }

  const session = sessions.get(chatId);
  session.lastUsed = now;

  return session.history;
};

setInterval(() => {
  const now = Date.now();

  for (const [chatId, session] of sessions.entries()) {
    if (now - session.lastUsed > SESSION_TTL) {
      sessions.delete(chatId);
    }
  }
}, 1000 * 60 * 10);

const pushMessage = (chatId, message) => {
  const history = getSession(chatId);
  history.push(message);

  if (history.length > MAX_HISTORY) {
    history.shift();
  }
};

const launchBot = () => {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply("Hello! Send me a message and I will respond using AI 🤖", {
      parse_mode: "HTML",
    });
  });

  bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const userMessage = ctx.message?.text?.trim();

    if (!userMessage) {
      return ctx.reply("Empty message");
    }

    pushMessage(chatId, { role: "user", content: userMessage });

    try {
      await ctx.sendChatAction("typing");

      const history = getSession(chatId);

      const aiResponse = await askAI([
        SYSTEM_PROMPT,
        ...history
      ]);

      pushMessage(chatId, {
        role: "assistant",
        content: aiResponse,
      });

      await ctx.reply(formatAIResponse(aiResponse), {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error(error);
      ctx.reply("AI error 😢");
    }
  });
  
  bot.command('reset', (ctx) => {
    sessions.delete(ctx.chat.id);
    ctx.reply("Memory cleared 🧠");
  });

  bot.launch();
  console.log("Telegram bot is running...");
};

export default { launchBot };
