import SessionService from '../../services/session.service.js';

export default (ctx) => {
  SessionService.reset(ctx.chat.id);
  ctx.reply('Memory cleared');
};
