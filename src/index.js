import 'dotenv/config';
import express from 'express';
import telegramService from './bot/telegram.service.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN;
const WEBHOOK_PATH = '/telegram-webhook';
const WEBHOOK_URL = `${DOMAIN}${WEBHOOK_PATH}`;

const bot = telegramService.createBot();

app.use(bot.webhookCallback(WEBHOOK_PATH));

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  const result = await bot.telegram.setWebhook(WEBHOOK_URL);
  console.log('Webhook set:', result);

  console.log(await bot.telegram.getWebhookInfo());
});

// graceful shutdown
process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
