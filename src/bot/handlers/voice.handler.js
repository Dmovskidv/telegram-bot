import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

import AiService from '../../services/ai.service.js';
import SessionService from '../../services/session.service.js';
import rateLimit from '../../services/rate-limit.service.js';
import { formatAIResponse } from '../../utils/format.js';

const TEMP_DIR = path.resolve('temp');
const MAX_VOICE_SIZE = 10 * 1024 * 1024; // 10MB
const TIMEOUT_MS = 15000;

export default async function voiceHandler(ctx) {
  const chatId = ctx.chat?.id;
  const fileId = ctx.message?.voice?.file_id;

  if (!chatId || !fileId) {
    return ctx.reply('Invalid voice message');
  }

  if (rateLimit.isLimited(chatId)) {
    return ctx.reply('Too many requests');
  }

  await ctx.sendChatAction('typing');

  const filePath = path.join(TEMP_DIR, `${Date.now()}.ogg`);

  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const link = await ctx.telegram.getFileLink(fileId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(link.href, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok || !response.body) {
      throw new Error('Failed to download voice file');
    }

    const contentLength = response.headers.get('content-length');

    console.log('Voice file size:', contentLength);

    if (contentLength && Number(contentLength) > MAX_VOICE_SIZE) {
      return ctx.reply('Voice message is too large');
    }

    await pipeline(response.body, createWriteStream(filePath));

    const text = await AiService.transcribe(filePath);

    console.log('Transcribed text:', text);

    if (!text?.trim()) {
      return ctx.reply('Could not recognize speech');
    }

    // atomic session update (prevents race issues)
    const history = SessionService.getHistory(chatId);

    const aiResponse = await AiService.generate(history);

    SessionService.addAssistantMessage(chatId, aiResponse);

    await ctx.reply(formatAIResponse(aiResponse), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error('Voice handler error:', error);

    const message =
      error.name === 'AbortError'
        ? 'Request timeout while downloading voice'
        : 'Something went wrong processing your voice message';

    await ctx.reply(message);
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Temp file cleanup failed:', err);
    }
  }
}
