export default (ctx) => {
  ctx.reply("Hello! Send me a message and I will respond using AI", {
    parse_mode: "HTML",
  });
};