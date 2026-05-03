import { Telegraf } from "telegraf";
import startHandler from "./handlers/start.handler.js";
import textHandler from "./handlers/text.handler.js";
import resetHandler from "./handlers/reset.handler.js";

const createBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }
  
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  bot.start(startHandler);
  bot.on("text", textHandler);
  bot.command("reset", resetHandler);

  return bot;
};

export default { createBot };
