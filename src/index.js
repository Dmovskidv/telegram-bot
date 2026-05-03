import "dotenv/config";
import express from "express";
import telegramService from "./bot/telegram.service.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN;

const bot = telegramService.createBot();

app.use(bot.webhookCallback("/telegram-webhook"));

app.get("/", (req, res) => res.send("OK"));

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  if (DOMAIN) {
    await bot.telegram.setWebhook(`${DOMAIN}/telegram-webhook`);
    console.log("Webhook set");
  }
});

// graceful shutdown
process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));