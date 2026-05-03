export default (ctx) => {
  sessions.delete(ctx.chat.id);
  ctx.reply("Memory cleared");
};