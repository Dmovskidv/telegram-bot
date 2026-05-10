export default (ctx) => {
  log('RESET_HANDLER_TRIGGERED:', ctx.chat.id);
  sessions.delete(ctx.chat.id);
  ctx.reply("Memory cleared");
};