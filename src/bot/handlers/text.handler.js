import aiService from '../../services/ai.service.js';
import SessionService from '../../services/session.service.js';
import rateLimit from '../../services/rate-limit.service.js';
import { formatAIResponse } from '../../utils/format.js';

export default async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const text = ctx.message?.text?.trim();

    if (!text) return ctx.reply('Empty message');

    if (rateLimit.isLimited(chatId)) {
      return ctx.reply('Too many requests');
    }

    await ctx.sendChatAction('typing');

    SessionService.addUserMessage(chatId, text);

    const history = SessionService.getHistory(chatId);

    console.log('HISTORY:', history);

    const aiResponse = await aiService.generate(history);

    SessionService.addAssistantMessage(chatId, aiResponse);

    console.log('AI_RESPONSE:', aiResponse);

    await ctx.reply(formatAIResponse(aiResponse), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error('TEXT_HANDLER_ERROR:', err);
    await ctx.reply('Something went wrong 😢');
  }
};
